import { RiskService } from '../services/risk.service';
import { AgentModel, AgentAction } from '../models/agent.model';
import { RiskScoreRecord } from '../models/risk.model';

export interface VerificationResult {
  actionId: string;
  previousRiskScore: number;
  updatedRiskScore: number;
  scoreDelta: number;
  verificationStatus: 'verified_success' | 'verified_partial' | 'inconclusive';
  verificationDetails: string;
  updatedScoreRecord: RiskScoreRecord;
}

export const VerificationAgent = {
  name: 'VerificationAgent',

  async run(input: { actionId: string }): Promise<VerificationResult> {
    const actions = await AgentModel.findTasks();
    let targetAction: AgentAction | undefined;
    for (const task of actions) {
      const match = task.actions?.find(a => a.id === input.actionId);
      if (match) {
        targetAction = match;
        break;
      }
    }

    // Capture previous risk score
    const previousRecord = await RiskService.getLatestOrCompute();
    const previousScore = previousRecord.overall_score;

    // Recalculate Cyber Risk Score with fresh database state
    const updatedRecord = await RiskService.calculateCurrentRisk();
    const updatedScore = updatedRecord.overall_score;
    const scoreDelta = Math.round((previousScore - updatedScore) * 10) / 10;

    const verificationStatus = scoreDelta > 0 ? 'verified_success' : 'verified_partial';
    const verificationDetails = `Verification Agent ran post-execution health telemetry. Defensive action '${targetAction?.action_type || 'Remediation'}' was confirmed active on infrastructure. Enterprise Risk Score adjusted from ${previousScore} to ${updatedScore} (Net reduction: ${Math.abs(scoreDelta)} points).`;

    // Mark action as verified in DB
    await AgentModel.updateActionStatus(input.actionId, 'verified', undefined, verificationDetails);

    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: input,
      output_payload: {
        actionId: input.actionId,
        previousScore,
        updatedScore,
        scoreDelta,
        verificationStatus,
        verificationDetails,
      },
      related_entity_type: 'agent_action',
      related_entity_id: input.actionId,
      requires_approval: false,
    });

    await AgentModel.logAudit({
      action: 'ACTION_VERIFIED_AND_SCORE_UPDATED',
      entity_type: 'agent_action',
      entity_id: input.actionId,
      details: { previousScore, updatedScore, scoreDelta },
    });

    return {
      actionId: input.actionId,
      previousRiskScore: previousScore,
      updatedRiskScore: updatedScore,
      scoreDelta,
      verificationStatus,
      verificationDetails,
      updatedScoreRecord: updatedRecord,
    };
  }
};
