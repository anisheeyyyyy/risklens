import { Request, Response, NextFunction } from 'express';
import { RiskService } from '../services/risk.service';
import { AgentModel } from '../models/agent.model';

export const getRiskScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const score = await RiskService.getLatestOrCompute();
    const history = await RiskService.getHistory();
    res.json({
      success: true,
      data: {
        current: score,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recalculateRiskScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const freshScore = await RiskService.calculateCurrentRisk();
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'RISK_SCORE_RECALCULATED',
      entity_type: 'risk_score',
      entity_id: freshScore.id,
      details: { overallScore: freshScore.overall_score, riskLevel: freshScore.risk_level },
    });
    res.json({ success: true, data: freshScore });
  } catch (error) {
    next(error);
  }
};
