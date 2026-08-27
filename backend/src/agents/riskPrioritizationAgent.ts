import { AgentModel } from '../models/agent.model';
import { DetectedRisk } from './riskDetectionAgent';

export interface PrioritizedRisk extends DetectedRisk {
  impactScore: number;       // 1 - 10
  likelihoodScore: number;   // 1 - 10
  criticalityWeight: number; // 1 - 10
  compositePriorityScore: number; // Product / normalized (0 - 100)
  rank: number;
  priorityLabel: 'P0 - Urgent' | 'P1 - High' | 'P2 - Moderate' | 'P3 - Low';
}

export const RiskPrioritizationAgent = {
  name: 'RiskPrioritizationAgent',

  async run(input: { detectedRisks: DetectedRisk[] }): Promise<{ prioritizedRisks: PrioritizedRisk[]; summary: string }> {
    const prioritizedRisks: PrioritizedRisk[] = input.detectedRisks.map(risk => {
      let impact = 6;
      let likelihood = 5;
      let criticality = 6;

      if (risk.severity === 'Critical') {
        impact = 9.5;
        likelihood = 8.5;
        criticality = 9.0;
      } else if (risk.severity === 'High') {
        impact = 7.5;
        likelihood = 7.0;
        criticality = 7.5;
      }

      if (risk.category === 'Perimeter Vulnerability' || risk.category === 'Data Exfiltration') {
        likelihood = Math.min(10, likelihood + 1.0);
      }

      // Priority formula: (Impact * 0.40 + Likelihood * 0.35 + Criticality * 0.25) * 10
      const composite = Math.round((impact * 0.40 + likelihood * 0.35 + criticality * 0.25) * 10 * 10) / 10;

      let priorityLabel: PrioritizedRisk['priorityLabel'] = 'P2 - Moderate';
      if (composite >= 85) priorityLabel = 'P0 - Urgent';
      else if (composite >= 70) priorityLabel = 'P1 - High';
      else if (composite >= 50) priorityLabel = 'P2 - Moderate';
      else priorityLabel = 'P3 - Low';

      return {
        ...risk,
        impactScore: impact,
        likelihoodScore: likelihood,
        criticalityWeight: criticality,
        compositePriorityScore: composite,
        rank: 0,
        priorityLabel,
      };
    });

    // Sort descending by composite priority
    prioritizedRisks.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);
    prioritizedRisks.forEach((item, index) => {
      item.rank = index + 1;
    });

    const summary = `Prioritized ${prioritizedRisks.length} detected risks using Impact × Likelihood × Criticality matrix. Top urgent risk: ${prioritizedRisks[0]?.riskName || 'None'}.`;

    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: input,
      output_payload: { prioritizedRisks, summary },
      requires_approval: false,
    });

    await AgentModel.logAudit({
      action: 'RISK_PRIORITIZATION_COMPLETED',
      entity_type: 'agent_task',
      entity_id: task.id,
      details: { topPriorityScore: prioritizedRisks[0]?.compositePriorityScore },
    });

    return { prioritizedRisks, summary };
  }
};
