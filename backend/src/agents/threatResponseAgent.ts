import { ThreatModel } from '../models/threat.model';
import { AgentModel, AgentTask, AgentAction } from '../models/agent.model';

export interface ThreatResponseProposal {
  threatId: string;
  threatName: string;
  assetId?: string;
  proposedActionType: string;
  actionDescription: string;
  riskJustification: string;
  requiresHumanApproval: true;
  task: AgentTask;
  action: AgentAction;
}

export const ThreatResponseAgent = {
  name: 'ThreatResponseAgent',

  async run(input: { threatId: string; actionType?: string }): Promise<ThreatResponseProposal> {
    const threat = await ThreatModel.findById(input.threatId);
    if (!threat) {
      throw new Error(`Threat with ID ${input.threatId} not found`);
    }

    const actionType = input.actionType || 'Isolate Compromised Asset';
    const actionDescription = `Execute immediate network-layer isolation on ${threat.asset_name || 'affected node'} and deploy perimeter firewall block on IOC: ${threat.indicator_of_compromise || '198.51.100.244'}.`;
    const riskJustification = `Threat severity is ${threat.severity} (${threat.threat_type}). Immediate containment prevents lateral expansion and data exfiltration.`;

    // Create Agent Task with status 'pending_approval'
    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'pending_approval',
      input_payload: input,
      output_payload: {
        threatId: threat.id,
        actionType,
        actionDescription,
        riskJustification,
        status: 'Awaiting Human-in-the-Loop Authorization',
      },
      related_entity_type: 'threat',
      related_entity_id: threat.id,
      requires_approval: true,
    });

    // Create Agent Action with status 'pending_approval'
    const action = await AgentModel.createAction({
      task_id: task.id,
      action_type: actionType,
      description: actionDescription,
      status: 'pending_approval',
      result_summary: 'Pending SecOps Analyst authorization before execution.',
    });

    await AgentModel.logAudit({
      action: 'THREAT_RESPONSE_ACTION_PROPOSED',
      entity_type: 'agent_action',
      entity_id: action.id,
      details: { threatId: threat.id, actionType, requiresApproval: true },
    });

    return {
      threatId: threat.id,
      threatName: threat.threat_name,
      assetId: threat.asset_id,
      proposedActionType: actionType,
      actionDescription,
      riskJustification,
      requiresHumanApproval: true,
      task,
      action,
    };
  }
};
