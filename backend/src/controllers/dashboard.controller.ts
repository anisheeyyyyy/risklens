import { Request, Response, NextFunction } from 'express';
import { RiskService } from '../services/risk.service';
import { AssetModel } from '../models/asset.model';
import { VulnerabilityModel } from '../models/vulnerability.model';
import { ThreatModel } from '../models/threat.model';
import { AlertModel } from '../models/alert.model';
import { EventModel } from '../models/event.model';
import { AgentModel } from '../models/agent.model';

export const getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const riskScore = await RiskService.getLatestOrCompute();
    const riskHistory = await RiskService.getHistory();
    const assetStats = await AssetModel.count();
    const vulnStats = await VulnerabilityModel.countBySeverity();
    const threatStats = await ThreatModel.count();
    const alertStats = await AlertModel.count();
    const recentEvents = await EventModel.findAll(10);
    const activeAlerts = await AlertModel.findAll({ status: 'Open', limit: 6 });
    const recentAgentTasks = await AgentModel.findTasks({ limit: 8 });

    // Query top active threat & vulnerability for dynamic recommendation
    const topThreats = await ThreatModel.findAll({ status: 'Active', limit: 1 });
    const topVulns = await VulnerabilityModel.findAll({ severity: 'Critical', status: 'Open', limit: 1 });
    
    let topRecommendation = {
      title: 'Maintain Active Telemetry Monitoring',
      description: 'All critical vectors are currently within baseline thresholds. Continuous monitoring is active across monitored endpoints.',
      agent: 'RiskDetectionAgent',
      estimatedReduction: '5.0 pts',
      targetAsset: 'Global Perimeter',
    };

    if (topThreats.length > 0) {
      const t = topThreats[0];
      topRecommendation = {
        title: `Immediate Containment & Egress Filter for ${t.asset_name || 'Target Asset'}`,
        description: `Threat Investigation Agent correlated active campaign "${t.threat_name}" (${t.threat_type}). Recommended immediate defensive quarantine to prevent lateral movement.`,
        agent: 'ThreatResponseAgent',
        estimatedReduction: '18.5 pts',
        targetAsset: t.asset_name || 'Perimeter Network',
      };
    } else if (topVulns.length > 0) {
      const v = topVulns[0];
      topRecommendation = {
        title: `Deploy Virtual Patch for ${v.cve_id} on ${v.asset_name || 'Core Node'}`,
        description: `Remediation Agent prioritized unauthenticated exploit ${v.title}. Applying vendor patch or WAF filter reduces critical exploit exposure.`,
        agent: 'VulnerabilityRemediationAgent',
        estimatedReduction: '14.2 pts',
        targetAsset: v.asset_name || 'Core Asset',
      };
    }

    // Security Posture Health % (100 - risk score)
    const securityHealthScore = Math.max(5, Math.min(100, Math.round(100 - riskScore.overall_score)));

    res.json({
      success: true,
      data: {
        riskScore,
        riskHistory,
        stats: {
          protectedAssets: assetStats.total,
          criticalAssets: assetStats.critical,
          openVulnerabilities: vulnStats.total - vulnStats.resolved,
          criticalVulnerabilities: vulnStats.critical,
          activeThreats: threatStats.active,
          criticalThreats: threatStats.critical,
          openAlerts: alertStats.open,
          securityHealthScore,
        },
        topRecommendation,
        recentEvents,
        activeAlerts,
        recentAgentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
