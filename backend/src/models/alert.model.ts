import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source_type: 'vulnerability' | 'threat' | 'security_event' | 'system';
  asset_id: string;
  asset_name?: string;
  vulnerability_id?: string;
  threat_id?: string;
  security_event_id?: string;
  status: 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const AlertModel = {
  async findAll(filters: {
    severity?: string;
    status?: string;
    source_type?: string;
    limit?: number;
  } = {}): Promise<Alert[]> {
    let sql = `SELECT * FROM alerts WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.severity) {
      sql += ` AND severity = $${paramIndex++}`;
      params.push(filters.severity);
    }
    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.source_type) {
      sql += ` AND source_type = $${paramIndex++}`;
      params.push(filters.source_type);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const [alertRes, assetRes, userRes] = await Promise.all([
      query<Alert>(sql, params),
      query('SELECT id, name FROM assets'),
      query('SELECT id, full_name FROM users'),
    ]);

    const assetMap = new Map<string, string>();
    for (const a of assetRes.rows) {
      assetMap.set(a.id, a.name);
    }

    const userMap = new Map<string, string>();
    for (const u of userRes.rows) {
      userMap.set(u.id, u.full_name);
    }

    const severityOrder: Record<string, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    const alerts = alertRes.rows.map(al => ({
      ...al,
      asset_name: al.asset_id ? assetMap.get(al.asset_id) : undefined,
      acknowledged_by_name: al.acknowledged_by ? userMap.get(al.acknowledged_by) : undefined,
    }));

    alerts.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));
    return alerts;
  },

  async findById(id: string): Promise<Alert | null> {
    const res = await query<Alert>('SELECT * FROM alerts WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const alert = res.rows[0];

    if (alert.asset_id) {
      const assetRes = await query('SELECT name FROM assets WHERE id = $1', [alert.asset_id]);
      alert.asset_name = assetRes.rows[0]?.name;
    }
    if (alert.acknowledged_by) {
      const userRes = await query('SELECT full_name FROM users WHERE id = $1', [alert.acknowledged_by]);
      alert.acknowledged_by_name = userRes.rows[0]?.full_name;
    }
    return alert;
  },

  async create(data: {
    title: string;
    description: string;
    severity: string;
    source_type: string;
    asset_id: string;
    vulnerability_id?: string;
    threat_id?: string;
    security_event_id?: string;
  }): Promise<Alert> {
    const id = `alt-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO alerts (id, title, description, severity, source_type, asset_id, vulnerability_id, threat_id, security_event_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Open')
      RETURNING *
    `;
    const res = await query<Alert>(sql, [
      id,
      data.title,
      data.description,
      data.severity,
      data.source_type,
      data.asset_id,
      data.vulnerability_id || null,
      data.threat_id || null,
      data.security_event_id || null,
    ]);
    return res.rows[0];
  },

  async update(id: string, data: { status: 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed'; userId?: string }): Promise<Alert | null> {
    let sql = `
      UPDATE alerts
      SET status = $1::varchar,
          acknowledged_by = CASE WHEN $1::varchar = 'Acknowledged' THEN COALESCE($2::varchar, acknowledged_by) ELSE acknowledged_by END,
          acknowledged_at = CASE WHEN $1::varchar = 'Acknowledged' THEN NOW() ELSE acknowledged_at END,
          resolved_at = CASE WHEN $1::varchar = 'Resolved' THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
      WHERE id = $3::varchar
      RETURNING *
    `;
    const res = await query<Alert>(sql, [data.status, data.userId || null, id]);
    return res.rows[0] || null;
  },

  async count(): Promise<{ total: number; open: number; critical: number; high: number }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Open') as open,
        COUNT(*) FILTER (WHERE severity = 'Critical' AND status = 'Open') as critical,
        COUNT(*) FILTER (WHERE severity = 'High' AND status = 'Open') as high
      FROM alerts
    `;
    const res = await query(sql);
    const row = res.rows[0];
    return {
      total: Number(row.total || 0),
      open: Number(row.open || 0),
      critical: Number(row.critical || 0),
      high: Number(row.high || 0),
    };
  }
};
