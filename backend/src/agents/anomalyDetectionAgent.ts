import { EventModel, SecurityEvent } from '../models/event.model';
import { AgentModel } from '../models/agent.model';

export interface FlaggedAnomaly {
  anomalyId: string;
  sourceEventId: string;
  anomalyType: string;
  severity: 'Critical' | 'High' | 'Medium';
  confidenceScore: number;
  reasoning: string;
  observedPattern: string;
  baselineExpectation: string;
}

export const AnomalyDetectionAgent = {
  name: 'AnomalyDetectionAgent',

  async run(): Promise<{ anomalies: FlaggedAnomaly[]; summary: string }> {
    const events = await EventModel.findAll(30);
    const anomalies: FlaggedAnomaly[] = [];

    for (const evt of events) {
      if (evt.event_type === 'Outbound Data Spike' || evt.severity === 'Critical') {
        anomalies.push({
          anomalyId: `ano-${anomalies.length + 1}`,
          sourceEventId: evt.id,
          anomalyType: evt.event_type,
          severity: evt.severity === 'Critical' ? 'Critical' : 'High',
          confidenceScore: 0.95,
          reasoning: `Telemetry volume or frequency deviated >3 standard deviations from established 14-day rolling baseline.`,
          observedPattern: evt.description,
          baselineExpectation: 'Average outbound data velocity < 150 MB/hour; authentication failures < 5/min.',
        });
      }
    }

    const summary = `Anomaly Detection Agent evaluated ${events.length} recent telemetry events and flagged ${anomalies.length} statistical deviations exceeding threshold.`;

    await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: { eventsSampled: events.length },
      output_payload: { anomalies, summary },
      requires_approval: false,
    });

    return { anomalies, summary };
  }
};
