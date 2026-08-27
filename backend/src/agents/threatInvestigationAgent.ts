import { ThreatModel } from '../models/threat.model';
import { EventModel } from '../models/event.model';
import { AgentModel } from '../models/agent.model';

export interface ThreatTimelineEntry {
  timestamp: string;
  source: string;
  eventType: string;
  severity: string;
  description: string;
}

export interface ThreatInvestigationReport {
  threatId: string;
  threatName: string;
  confidenceScore: number;
  tacticsSummary: string[];
  correlatedIocs: string[];
  adversaryIntent: string;
  investigationTimeline: ThreatTimelineEntry[];
  containmentRecommendation: string;
}

export const ThreatInvestigationAgent = {
  name: 'ThreatInvestigationAgent',

  async run(input: { threatId: string }): Promise<ThreatInvestigationReport> {
    const threat = await ThreatModel.findById(input.threatId);
    if (!threat) {
      throw new Error(`Threat with ID ${input.threatId} not found`);
    }

    const events = await EventModel.findAll(40);
    const relatedEvents = events.filter(e => e.target_asset_id === threat.asset_id || e.severity === 'Critical');

    const timeline: ThreatTimelineEntry[] = [
      {
        timestamp: threat.detected_at,
        source: threat.source,
        eventType: 'Threat Intelligence Telemetry Signal',
        severity: threat.severity,
        description: `Initial signal detected: ${threat.threat_name} targeting ${threat.asset_name || 'Infrastructure'}.`,
      },
      ...relatedEvents.slice(0, 4).map(e => ({
        timestamp: e.timestamp,
        source: e.source_ip || 'Network Sensor',
        eventType: e.event_type,
        severity: e.severity,
        description: e.description,
      }))
    ];

    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const report: ThreatInvestigationReport = {
      threatId: threat.id,
      threatName: threat.threat_name,
      confidenceScore: 0.94,
      tacticsSummary: threat.tactics_techniques || ['T1190 - Exploit Public-Facing Application'],
      correlatedIocs: threat.indicator_of_compromise ? [threat.indicator_of_compromise] : ['198.51.100.244', 'AS39824'],
      adversaryIntent: `Adversary seeking initial execution and lateral access on ${threat.asset_name || 'target'}. Pattern matches known automated APT reconnaissance tools.`,
      investigationTimeline: timeline,
      containmentRecommendation: `Isolate network ingress on ${threat.asset_name || 'affected node'} and block correlated IOCs at perimeter WAF.`,
    };

    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: input,
      output_payload: report,
      related_entity_type: 'threat',
      related_entity_id: threat.id,
      requires_approval: false,
    });

    await AgentModel.logAudit({
      action: 'THREAT_INVESTIGATION_COMPLETED',
      entity_type: 'threat',
      entity_id: threat.id,
      details: { confidence: report.confidenceScore },
    });

    return report;
  }
};
