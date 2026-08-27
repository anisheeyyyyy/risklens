import { Request, Response, NextFunction } from 'express';
import { ThreatModel } from '../models/threat.model';
import { ThreatInvestigationAgent } from '../agents/threatInvestigationAgent';
import { ThreatResponseAgent } from '../agents/threatResponseAgent';
import { AgentModel } from '../models/agent.model';

export const getThreats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { severity, status, threat_type, search } = req.query;
    const threats = await ThreatModel.findAll({
      severity: severity as string,
      status: status as string,
      threat_type: threat_type as string,
      search: search as string,
    });
    res.json({ success: true, data: threats });
  } catch (error) {
    next(error);
  }
};

export const getThreatById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const threat = await ThreatModel.findById(req.params.id);
    if (!threat) {
      res.status(404).json({
        success: false,
        error: { message: 'Threat not found', code: 'NOT_FOUND' },
      });
      return;
    }
    res.json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

export const createThreat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const threat = await ThreatModel.create(req.body);
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'THREAT_RECORDED',
      entity_type: 'threat',
      entity_id: threat.id,
      details: { threat_name: threat.threat_name, severity: threat.severity },
    });
    res.status(201).json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

export const updateThreat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ThreatModel.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: 'Threat not found', code: 'NOT_FOUND' },
      });
      return;
    }
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'THREAT_UPDATED',
      entity_type: 'threat',
      entity_id: updated.id,
      details: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const investigateThreat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const investigation = await ThreatInvestigationAgent.run({ threatId: req.params.id });
    res.json({ success: true, data: investigation });
  } catch (error) {
    next(error);
  }
};

export const proposeThreatResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal = await ThreatResponseAgent.run({
      threatId: req.params.id,
      actionType: req.body.actionType,
    });
    res.json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};
