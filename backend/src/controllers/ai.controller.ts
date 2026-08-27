import { Request, Response, NextFunction } from 'express';
import { Orchestrator } from '../agents/orchestrator';
import { RiskForecastingAgent } from '../agents/riskForecastingAgent';
import { AnomalyDetectionAgent } from '../agents/anomalyDetectionAgent';
import { ComplianceAgent } from '../agents/complianceAgent';
import { AgentModel } from '../models/agent.model';
import { query } from '../config/database';

export const getInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const insightsRes = await query('SELECT * FROM ai_insights ORDER BY created_at DESC');
    const forecast = await RiskForecastingAgent.run();
    const anomalies = await AnomalyDetectionAgent.run();
    const compliance = await ComplianceAgent.run();

    res.json({
      success: true,
      data: {
        insights: insightsRes.rows,
        forecast,
        anomalies: anomalies.anomalies,
        compliance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const triggerFullAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pipelineResult = await Orchestrator.runFullPipeline(req.body);
    res.json({ success: true, data: pipelineResult });
  } catch (error) {
    next(error);
  }
};

export const getAgentTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, agent_name } = req.query;
    const tasks = await AgentModel.findTasks({
      status: status as string,
      agent_name: agent_name as string,
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const runAgentPipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Orchestrator.runFullPipeline(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const approveAgentTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Orchestrator.approveTask(req.params.id, req.user?.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rejectAgentTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const task = await Orchestrator.rejectTask(req.params.id, req.user?.id, reason);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
