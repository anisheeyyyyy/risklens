import { AssetModel } from '../models/asset.model';
import { VulnerabilityModel } from '../models/vulnerability.model';
import { ThreatModel } from '../models/threat.model';
import { EventModel } from '../models/event.model';
import { AgentModel } from '../models/agent.model';

export interface DetectedRisk {
  id: string;
  riskName: string;
  category: 'Perimeter Vulnerability' | 'Credential Exposure' | 'Lateral Movement' | 'Data Exfiltration' | 'Compliance Drift';
  targetAssetId: string;
  targetAssetName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  evidence: string[];
  correlatedCves: string[];
  correlatedThreats: string[];
}

export const RiskDetectionAgent = {
  name: 'RiskDetectionAgent',

  async run(input: { scanWindowHours?: number } = {}): Promise<{ detectedRisks: DetectedRisk[]; summary: string }> {
    const [assets, vulns, threats, events] = await Promise.all([
      AssetModel.findAll(),
      VulnerabilityModel.findAll({ status: 'Open' }),
      ThreatModel.findAll(),
      EventModel.findAll(30),
    ]);

    const detectedRisks: DetectedRisk[] = [];

    // 1. Correlate Critical CVEs on Internet-facing or Critical Assets
    for (const asset of assets) {
      const assetVulns = vulns.filter(v => v.asset_id === asset.id);
      const assetThreats = threats.filter(t => t.asset_id === asset.id && (t.status === 'Active' || t.status === 'Investigating'));
      const assetEvents = events.filter(e => e.target_asset_id === asset.id && e.severity === 'Critical');

      const critVulns = assetVulns.filter(v => v.severity === 'Critical');

      if (critVulns.length > 0 && (asset.criticality === 'Critical' || (asset.tags && asset.tags.includes('public-facing')))) {
        detectedRisks.push({
          id: `det-risk-${detectedRisks.length + 1}`,
          riskName: `Critical Perimeter Exploit Risk on ${asset.name}`,
          category: 'Perimeter Vulnerability',
          targetAssetId: asset.id,
          targetAssetName: asset.name,
          severity: 'Critical',
          evidence: [
            `Asset is marked as ${asset.criticality} criticality located at ${asset.location || 'Primary DC'}.`,
            `Exposed to ${critVulns.length} Critical unpatched CVE(s): ${critVulns.map(v => v.cve_id).join(', ')}.`,
            assetThreats.length > 0 ? `Associated active threat: ${assetThreats[0].threat_name}` : 'Probing activity observed in telemetry.',
          ],
          correlatedCves: critVulns.map(v => v.cve_id),
          correlatedThreats: assetThreats.map(t => t.id),
        });
      }

      // Check for active data exfiltration or abnormal egress
      const exfilThreat = assetThreats.find(t => t.threat_type === 'Data Exfiltration' || t.threat_type === 'Ransomware Activity');
      if (exfilThreat) {
        detectedRisks.push({
          id: `det-risk-${detectedRisks.length + 1}`,
          riskName: `High-Urgency Threat Incident: ${exfilThreat.threat_name} on ${asset.name}`,
          category: 'Data Exfiltration',
          targetAssetId: asset.id,
          targetAssetName: asset.name,
          severity: exfilThreat.severity,
          evidence: [
            `Active telemetry detection flagged indicator: ${exfilThreat.indicator_of_compromise || 'Abnormal volume spike'}.`,
            `Tactics: ${(exfilThreat.tactics_techniques || []).join(', ')}.`,
            exfilThreat.description,
          ],
          correlatedCves: assetVulns.map(v => v.cve_id),
          correlatedThreats: [exfilThreat.id],
        });
      }
    }

    const summary = `Risk Detection Agent analyzed ${assets.length} assets, ${vulns.length} open vulnerabilities, and ${threats.length} threats. Discovered ${detectedRisks.length} composite risk patterns requiring prioritization.`;

    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: input,
      output_payload: { detectedRisks, summary },
      related_entity_type: 'overall_posture',
      requires_approval: false,
    });

    await AgentModel.logAudit({
      action: 'RISK_DETECTION_COMPLETED',
      entity_type: 'agent_task',
      entity_id: task.id,
      details: { detectedRisksCount: detectedRisks.length },
    });

    return { detectedRisks, summary };
  }
};
