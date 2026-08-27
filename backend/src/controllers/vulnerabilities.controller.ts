import { Request, Response, NextFunction } from 'express';
import { VulnerabilityModel } from '../models/vulnerability.model';
import { VulnerabilityRemediationAgent } from '../agents/vulnerabilityRemediationAgent';
import { AgentModel } from '../models/agent.model';

export const getVulnerabilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { severity, status, asset_id, search } = req.query;
    const vulns = await VulnerabilityModel.findAll({
      severity: severity as string,
      status: status as string,
      asset_id: asset_id as string,
      search: search as string,
    });
    res.json({ success: true, data: vulns });
  } catch (error) {
    next(error);
  }
};

export const getVulnerabilityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vuln = await VulnerabilityModel.findById(req.params.id);
    if (!vuln) {
      res.status(404).json({
        success: false,
        error: { message: 'Vulnerability not found', code: 'NOT_FOUND' },
      });
      return;
    }
    res.json({ success: true, data: vuln });
  } catch (error) {
    next(error);
  }
};

export const createVulnerability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vuln = await VulnerabilityModel.create(req.body);
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'VULNERABILITY_CREATED',
      entity_type: 'vulnerability',
      entity_id: vuln.id,
      details: { cve_id: vuln.cve_id, severity: vuln.severity },
    });
    res.status(201).json({ success: true, data: vuln });
  } catch (error) {
    next(error);
  }
};

export const updateVulnerability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await VulnerabilityModel.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: 'Vulnerability not found', code: 'NOT_FOUND' },
      });
      return;
    }
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'VULNERABILITY_UPDATED',
      entity_type: 'vulnerability',
      entity_id: updated.id,
      details: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getVulnerabilityRemediation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await VulnerabilityRemediationAgent.run({ vulnerabilityId: req.params.id });
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
