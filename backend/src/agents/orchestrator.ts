import { RiskDetectionAgent } from './riskDetectionAgent';
import { ThreatInvestigationAgent } from './threatInvestigationAgent';
import { RiskPrioritizationAgent } from './riskPrioritizationAgent';
import { VulnerabilityRemediationAgent } from './vulnerabilityRemediationAgent';
import { ThreatResponseAgent } from './threatResponseAgent';
import { RiskForecastingAgent } from './riskForecastingAgent';
import { VerificationAgent } from './verificationAgent';
import { ThreatModel } from '../models/threat.model';
import { VulnerabilityModel } from '../models/vulnerability.model';
import { AssetModel } from '../models/asset.model';
import { AgentModel, AgentTask, AgentAction } from '../models/agent.model';
import { RiskService } from '../services/risk.service';

export interface PipelineRunResult {
  runId: string;
  timestamp: string;
  stepResults: {
    riskDetection: any;
    riskPrioritization: any;
    threatInvestigation?: any;
    vulnerabilityRemediation?: any;
    threatResponseProposal?: any;
  };
  pipelineStatus: 'awaiting_human_approval' | 'completed';
  pendingApprovalTask?: AgentTask;
  message: string;
}

export const Orchestrator = {
  async runFullPipeline(options: { autoTargetCritical?: boolean } = {}): Promise<PipelineRunResult> {
    const runId = `pipe-${Date.now()}`;
    await AgentModel.logAudit({
      action: 'ORCHESTRATOR_PIPELINE_STARTED',
      entity_type: 'pipeline',
      entity_id: runId,
      details: options,
    });

    // Step 1: Autonomous Risk Detection
    const detectionRes = await RiskDetectionAgent.run();

    // Step 2: Autonomous Risk Prioritization
    const prioritizationRes = await RiskPrioritizationAgent.run({
      detectedRisks: detectionRes.detectedRisks,
    });

    // Step 3: Deep Investigation of top active threat
    const activeThreats = await ThreatModel.findAll({ status: 'Active' });
    let investigationRes: any = null;
    if (activeThreats.length > 0) {
      investigationRes = await ThreatInvestigationAgent.run({ threatId: activeThreats[0].id });
    }

    // Step 4: Vulnerability Remediation Playbook Generation (Analytical / Non-destructive)
    const openVulns = await VulnerabilityModel.findAll({ severity: 'Critical', status: 'Open' });
    let remediationRes: any = null;
    if (openVulns.length > 0) {
      remediationRes = await VulnerabilityRemediationAgent.run({ vulnerabilityId: openVulns[0].id });
    }

    // Step 5: Threat Response Action Proposal (SENSITIVE ACTION -> Enters Human-in-the-Loop Approval Gate)
    let responseProposal: any = null;
    let pendingTask: AgentTask | undefined;

    if (activeThreats.length > 0) {
      const targetThreat = activeThreats[0];
      responseProposal = await ThreatResponseAgent.run({
        threatId: targetThreat.id,
        actionType: 'Isolate Compromised Asset & Block Egress',
      });
      pendingTask = responseProposal.task;
    }

    const result: PipelineRunResult = {
      runId,
      timestamp: new Date().toISOString(),
      stepResults: {
        riskDetection: detectionRes,
        riskPrioritization: prioritizationRes,
        threatInvestigation: investigationRes,
        vulnerabilityRemediation: remediationRes,
        threatResponseProposal: responseProposal,
      },
      pipelineStatus: pendingTask ? 'awaiting_human_approval' : 'completed',
      pendingApprovalTask: pendingTask,
      message: pendingTask
        ? `Pipeline completed analytical analysis and generated 1 sensitive containment action requiring human authorization before execution.`
        : `Pipeline completed all autonomous assessment stages successfully.`,
    };

    return result;
  },

  async approveTask(taskId: string, userId: string = 'usr-002'): Promise<{
    task: AgentTask;
    executedAction: AgentAction;
    verification: any;
    updatedRiskScore: any;
  }> {
    const task = await AgentModel.findTaskById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const action = task.actions && task.actions[0];
    if (!action) {
      throw new Error(`No associated action found for task ${taskId}`);
    }

    // 1. Perform execution state update on related entity
    if (task.related_entity_type === 'threat' && task.related_entity_id) {
      await ThreatModel.update(task.related_entity_id, { status: 'Contained' });
    } else if (task.related_entity_type === 'vulnerability' && task.related_entity_id) {
      await VulnerabilityModel.update(task.related_entity_id, { status: 'In Progress' });
    } else if (task.related_entity_type === 'asset' && task.related_entity_id) {
      await AssetModel.update(task.related_entity_id, { status: 'Isolated' });
    }

    // 2. Mark Action as approved and executed
    const executedAction = await AgentModel.updateActionStatus(
      action.id,
      'executed',
      userId,
      `Action executed successfully by SecOps analyst (${userId}). Defensive network quarantine applied.`
    );

    // 3. Mark Task as completed
    const updatedTask = await AgentModel.updateTaskStatus(taskId, 'completed', {
      approvalStatus: 'Approved',
      approvedBy: userId,
      executionTimestamp: new Date().toISOString(),
    });

    await AgentModel.logAudit({
      user_id: userId,
      action: 'HUMAN_APPROVAL_GRANTED',
      entity_type: 'agent_action',
      entity_id: action.id,
      details: { taskId, actionType: action.action_type },
    });

    // 4. Run Verification Agent to measure score change
    const verification = await VerificationAgent.run({ actionId: action.id });

    return {
      task: updatedTask || task,
      executedAction: executedAction || action,
      verification,
      updatedRiskScore: verification.updatedScoreRecord,
    };
  },

  async rejectTask(taskId: string, userId: string = 'usr-002', reason?: string): Promise<AgentTask> {
    const task = await AgentModel.findTaskById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const action = task.actions && task.actions[0];
    if (action) {
      await AgentModel.updateActionStatus(
        action.id,
        'rejected',
        userId,
        reason || 'Action rejected by SecOps Analyst review.'
      );
    }

    const updatedTask = await AgentModel.updateTaskStatus(taskId, 'rejected', {
      approvalStatus: 'Rejected',
      rejectedBy: userId,
      rejectionReason: reason || 'Operation not authorized.',
      rejectionTimestamp: new Date().toISOString(),
    });

    await AgentModel.logAudit({
      user_id: userId,
      action: 'HUMAN_APPROVAL_REJECTED',
      entity_type: 'agent_task',
      entity_id: taskId,
      details: { reason },
    });

    return updatedTask || task;
  }
};
