import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Threat {
  id: string;
  threat_name: string;
  threat_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source: string;
  asset_id?: string;
  asset_name?: string;
  status: 'Active' | 'Investigating' | 'Mitigated' | 'Contained' | 'Dismissed';
  indicator_of_compromise?: string;
  tactics_techniques?: string[];
  description: string;
  detected_at: string;
  mitigated_at?: string;
  created_at: string;
  updated_at: string;
}

export const ThreatModel = {
  async findAll(filters: {
    severity?: string;
    status?: string;
    threat_type?: string;
    search?: string;
    limit?: number;
  } = {}): Promise<Threat[]> {
    let sql = `SELECT * FROM threats WHERE 1=1`;
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
    if (filters.threat_type) {
      sql += ` AND threat_type = $${paramIndex++}`;
      params.push(filters.threat_type);
    }
    if (filters.search) {
      sql += ` AND (threat_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR source ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY detected_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const [threatRes, assetRes] = await Promise.all([
      query<Threat>(sql, params),
      query('SELECT id, name FROM assets'),
    ]);

    const assetMap = new Map<string, string>();
    for (const a of assetRes.rows) {
      assetMap.set(a.id, a.name);
    }

    const severityOrder: Record<string, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    const threats = threatRes.rows.map(t => ({
      ...t,
      asset_name: t.asset_id ? assetMap.get(t.asset_id) : undefined,
    }));

    threats.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));
    return threats;
  },

  async findById(id: string): Promise<Threat | null> {
    const res = await query<Threat>('SELECT * FROM threats WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const threat = res.rows[0];

    if (threat.asset_id) {
      const assetRes = await query('SELECT name FROM assets WHERE id = $1', [threat.asset_id]);
      threat.asset_name = assetRes.rows[0]?.name;
    }
    return threat;
  },

  async create(data: {
    threat_name: string;
    threat_type: string;
    severity: string;
    source: string;
    asset_id?: string;
    status?: string;
    indicator_of_compromise?: string;
    tactics_techniques?: string[];
    description: string;
  }): Promise<Threat> {
    const id = `thr-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO threats (id, threat_name, threat_type, severity, source, asset_id, status, indicator_of_compromise, tactics_techniques, description, detected_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;
    const res = await query<Threat>(sql, [
      id,
      data.threat_name,
      data.threat_type,
      data.severity,
      data.source,
      data.asset_id || null,
      data.status || 'Active',
      data.indicator_of_compromise || null,
      data.tactics_techniques || [],
      data.description,
    ]);
    return res.rows[0];
  },

  async update(id: string, data: Partial<Threat>): Promise<Threat | null> {
    const current = await this.findById(id);
    if (!current) return null;

    let mitigatedAt = (data.status === 'Mitigated' || data.status === 'Contained') ? new Date().toISOString() : current.mitigated_at;

    const sql = `
      UPDATE threats
      SET threat_name = COALESCE($1, threat_name),
          threat_type = COALESCE($2, threat_type),
          severity = COALESCE($3, severity),
          source = COALESCE($4, source),
          asset_id = COALESCE($5, asset_id),
          status = COALESCE($6, status),
          indicator_of_compromise = COALESCE($7, indicator_of_compromise),
          tactics_techniques = COALESCE($8, tactics_techniques),
          description = COALESCE($9, description),
          mitigated_at = $10,
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `;
    const res = await query<Threat>(sql, [
      data.threat_name,
      data.threat_type,
      data.severity,
      data.source,
      data.asset_id,
      data.status,
      data.indicator_of_compromise,
      data.tactics_techniques,
      data.description,
      mitigatedAt,
      id,
    ]);
    return res.rows[0] || null;
  },

  async count(): Promise<{ active: number; critical: number; high: number; total: number }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('Active', 'Investigating')) as active,
        COUNT(*) FILTER (WHERE severity = 'Critical' AND status IN ('Active', 'Investigating')) as critical,
        COUNT(*) FILTER (WHERE severity = 'High' AND status IN ('Active', 'Investigating')) as high
      FROM threats
    `;
    const res = await query(sql);
    const row = res.rows[0];
    return {
      total: Number(row.total || 0),
      active: Number(row.active || 0),
      critical: Number(row.critical || 0),
      high: Number(row.high || 0),
    };
  }
};
