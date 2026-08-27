import { query } from '../config/database';

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  source_ip?: string;
  target_asset_id?: string;
  target_asset_name?: string;
  raw_data?: any;
  description: string;
  timestamp: string;
}

export const EventModel = {
  async findAll(limit: number = 50): Promise<SecurityEvent[]> {
    const sql = `
      SELECT e.*, a.name as target_asset_name
      FROM security_events e
      LEFT JOIN assets a ON a.id = e.target_asset_id
      ORDER BY e.timestamp DESC
      LIMIT $1
    `;
    const res = await query<SecurityEvent>(sql, [limit]);
    return res.rows.map(row => ({
      ...row,
      raw_data: typeof row.raw_data === 'string' ? JSON.parse(row.raw_data) : row.raw_data,
    }));
  }
};
