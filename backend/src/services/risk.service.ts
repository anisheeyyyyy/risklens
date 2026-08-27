import { query } from '../config/database';
import { RiskModel, RiskScoreRecord, RiskFactor } from '../models/risk.model';

export const RiskService = {
  async calculateCurrentRisk(): Promise<RiskScoreRecord> {
    // 1. Vulnerability Severity Score (0-100)
    const vulnRes = await query(`
      SELECT 
        COUNT(*) as total_open,
        COUNT(*) FILTER (WHERE severity = 'Critical' AND status != 'Resolved') as crit_count,
        COUNT(*) FILTER (WHERE severity = 'High' AND status != 'Resolved') as high_count,
        COUNT(*) FILTER (WHERE severity = 'Medium' AND status != 'Resolved') as med_count,
        COUNT(*) FILTER (WHERE severity = 'Low' AND status != 'Resolved') as low_count,
        COALESCE(AVG(cvss_score) FILTER (WHERE status != 'Resolved'), 0) as avg_cvss
      FROM vulnerabilities
    `);
    const v = vulnRes.rows[0];
    const critVulns = Number(v.crit_count || 0);
    const highVulns = Number(v.high_count || 0);
    const avgCvss = parseFloat(v.avg_cvss || 0);

    let vulnScore = (avgCvss * 7.5) + (critVulns * 4.5) + (highVulns * 1.5);
    vulnScore = Math.min(100, Math.max(0, vulnScore));

    // 2. Asset Criticality Score (0-100)
    const [assetRes, exposedRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_assets,
          COUNT(*) FILTER (WHERE criticality = 'Critical') as crit_assets,
          COUNT(*) FILTER (WHERE criticality = 'High') as high_assets
        FROM assets
      `),
      query(`
        SELECT DISTINCT a.id 
        FROM assets a
        WHERE a.criticality IN ('Critical', 'High')
          AND (
            a.id IN (SELECT asset_id FROM vulnerabilities WHERE status != 'Resolved')
            OR a.id IN (SELECT asset_id FROM threats WHERE status IN ('Active', 'Investigating'))
          )
      `)
    ]);
    const a = assetRes.rows[0];
    const totalAssets = Number(a.total_assets || 1);
    const exposedCrit = Number(exposedRes.rowCount || 0);
    const critAssets = Number(a.crit_assets || 0);

    let assetScore = ((exposedCrit / Math.max(1, critAssets + Number(a.high_assets || 0))) * 60) + ((critAssets / totalAssets) * 40);
    assetScore = Math.min(100, Math.max(0, assetScore));

    // 3. Threat Exposure Score (0-100)
    const threatRes = await query(`
      SELECT 
        COUNT(*) as total_threats,
        COUNT(*) FILTER (WHERE status = 'Active') as active_threats,
        COUNT(*) FILTER (WHERE status = 'Investigating') as investigating_threats,
        COUNT(*) FILTER (WHERE severity = 'Critical' AND status IN ('Active', 'Investigating')) as crit_threats,
        COUNT(*) FILTER (WHERE severity = 'High' AND status IN ('Active', 'Investigating')) as high_threats
      FROM threats
    `);
    const t = threatRes.rows[0];
    const activeThreats = Number(t.active_threats || 0);
    const critThreats = Number(t.crit_threats || 0);
    const highThreats = Number(t.high_threats || 0);

    let threatScore = (critThreats * 22) + (highThreats * 12) + (activeThreats * 5);
    threatScore = Math.min(100, Math.max(0, threatScore));

    // 4. Security Event Velocity Score (0-100)
    const eventRes = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE severity = 'Critical') as crit_events,
        COUNT(*) FILTER (WHERE severity = 'High') as high_events
      FROM security_events
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    `);
    const e = eventRes.rows[0];
    const critEvents = Number(e.crit_events || 0);
    const highEvents = Number(e.high_events || 0);

    let eventScore = (critEvents * 18) + (highEvents * 8) + (Number(e.total_events || 0) * 1.2);
    eventScore = Math.min(100, Math.max(0, eventScore));

    const [alertRes, allAssetsRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as open_alerts,
          COUNT(*) FILTER (WHERE severity = 'Critical' AND status = 'Open') as crit_unack_alerts
        FROM alerts
      `),
      query(`SELECT status, tags FROM assets`)
    ]);
    const critUnack = Number(alertRes.rows[0]?.crit_unack_alerts || 0);
    const legacyCount = allAssetsRes.rows.filter((a: any) => 
      a.status === 'Under Maintenance' || (Array.isArray(a.tags) && a.tags.includes('legacy'))
    ).length;

    let controlsScore = (critUnack * 15) + (legacyCount * 12) + 20;
    controlsScore = Math.min(100, Math.max(0, controlsScore));

    // 5-Factor Weighted Score Formula
    const wVuln = 0.30;
    const wAsset = 0.20;
    const wThreat = 0.25;
    const wEvent = 0.15;
    const wControls = 0.10;

    const contribVuln = vulnScore * wVuln;
    const contribAsset = assetScore * wAsset;
    const contribThreat = threatScore * wThreat;
    const contribEvent = eventScore * wEvent;
    const contribControls = controlsScore * wControls;

    const rawTotal = contribVuln + contribAsset + contribThreat + contribEvent + contribControls;
    const overallScore = Math.min(100, Math.max(0, Math.round(rawTotal * 10) / 10));

    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    if (overallScore >= 80) riskLevel = 'Critical';
    else if (overallScore >= 60) riskLevel = 'High';
    else if (overallScore >= 30) riskLevel = 'Moderate';

    const factorBreakdown: RiskFactor[] = [
      {
        factor: 'Vulnerability Severity',
        weight: wVuln,
        score: Math.round(vulnScore * 10) / 10,
        contribution: Math.round(contribVuln * 10) / 10,
        explanation: `${critVulns} Critical and ${highVulns} High severity CVEs identified (CVSS Average: ${avgCvss.toFixed(1)}).`,
      },
      {
        factor: 'Asset Criticality',
        weight: wAsset,
        score: Math.round(assetScore * 10) / 10,
        contribution: Math.round(contribAsset * 10) / 10,
        explanation: `${exposedCrit} of ${critAssets} Tier-1 critical production assets exhibit active vulnerability or threat vectors.`,
      },
      {
        factor: 'Threat Exposure',
        weight: wThreat,
        score: Math.round(threatScore * 10) / 10,
        contribution: Math.round(contribThreat * 10) / 10,
        explanation: `${activeThreats} active threat campaigns (${critThreats} Critical, ${highThreats} High) detected across the kill-chain.`,
      },
      {
        factor: 'Security Event Velocity',
        weight: wEvent,
        score: Math.round(eventScore * 10) / 10,
        contribution: Math.round(contribEvent * 10) / 10,
        explanation: `${critEvents} critical security events and auth anomalies recorded in the preceding 24 hours.`,
      },
      {
        factor: 'Controls Gap',
        weight: wControls,
        score: Math.round(controlsScore * 10) / 10,
        contribution: Math.round(contribControls * 10) / 10,
        explanation: `${critUnack} unacknowledged critical alerts and unpatched legacy boundary configurations.`,
      },
    ];

    const record = await RiskModel.save({
      overall_score: overallScore,
      risk_level: riskLevel,
      vuln_severity_score: Math.round(vulnScore * 10) / 10,
      asset_criticality_score: Math.round(assetScore * 10) / 10,
      threat_exposure_score: Math.round(threatScore * 10) / 10,
      security_event_score: Math.round(eventScore * 10) / 10,
      controls_gap_score: Math.round(controlsScore * 10) / 10,
      factor_breakdown: factorBreakdown,
    });

    return record;
  },

  async getLatestOrCompute(): Promise<RiskScoreRecord> {
    const latest = await RiskModel.getLatest();
    if (latest) return latest;
    return await this.calculateCurrentRisk();
  },

  async getHistory(): Promise<RiskScoreRecord[]> {
    return await RiskModel.getHistory(30);
  }
};
