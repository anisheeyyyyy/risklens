import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  contribution: number;
  explanation: string;
}

export interface RiskScoreRecord {
  id: string;
  overall_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  vuln_severity_score: number;
  asset_criticality_score: number;
  threat_exposure_score: number;
  security_event_score: number;
  controls_gap_score: number;
  factor_breakdown: RiskFactor[];
  recorded_at: string;
}

export const RiskModel = {
  async getLatest(): Promise<RiskScoreRecord | null> {
    const sql = `
      SELECT * FROM risk_scores
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    const res = await query<RiskScoreRecord>(sql);
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...row,
      overall_score: parseFloat(row.overall_score as any) || 0,
      vuln_severity_score: parseFloat(row.vuln_severity_score as any) || 0,
      asset_criticality_score: parseFloat(row.asset_criticality_score as any) || 0,
      threat_exposure_score: parseFloat(row.threat_exposure_score as any) || 0,
      security_event_score: parseFloat(row.security_event_score as any) || 0,
      controls_gap_score: parseFloat(row.controls_gap_score as any) || 0,
      factor_breakdown: typeof row.factor_breakdown === 'string' ? JSON.parse(row.factor_breakdown) : (row.factor_breakdown || []),
    };
  },

  async getHistory(limit: number = 30): Promise<RiskScoreRecord[]> {
    const sql = `
      SELECT * FROM risk_scores
      ORDER BY recorded_at ASC
      LIMIT $1
    `;
    const res = await query<RiskScoreRecord>(sql, [limit]);
    return res.rows.map(row => ({
      ...row,
      overall_score: parseFloat(row.overall_score as any) || 0,
      vuln_severity_score: parseFloat(row.vuln_severity_score as any) || 0,
      asset_criticality_score: parseFloat(row.asset_criticality_score as any) || 0,
      threat_exposure_score: parseFloat(row.threat_exposure_score as any) || 0,
      security_event_score: parseFloat(row.security_event_score as any) || 0,
      controls_gap_score: parseFloat(row.controls_gap_score as any) || 0,
      factor_breakdown: typeof row.factor_breakdown === 'string' ? JSON.parse(row.factor_breakdown) : (row.factor_breakdown || []),
    }));
  },

  async save(data: Omit<RiskScoreRecord, 'id' | 'recorded_at'>): Promise<RiskScoreRecord> {
    const id = `rsc-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO risk_scores (
        id, overall_score, risk_level, vuln_severity_score, asset_criticality_score,
        threat_exposure_score, security_event_score, controls_gap_score, factor_breakdown, recorded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    const res = await query<RiskScoreRecord>(sql, [
      id,
      data.overall_score,
      data.risk_level,
      data.vuln_severity_score,
      data.asset_criticality_score,
      data.threat_exposure_score,
      data.security_event_score,
      data.controls_gap_score,
      JSON.stringify(data.factor_breakdown),
    ]);
    const row = res.rows[0];
    return {
      ...row,
      overall_score: parseFloat(row.overall_score as any) || 0,
      factor_breakdown: typeof row.factor_breakdown === 'string' ? JSON.parse(row.factor_breakdown) : (row.factor_breakdown || []),
    };
  }
};
