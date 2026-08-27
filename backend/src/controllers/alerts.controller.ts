import { Request, Response, NextFunction } from 'express';
import { AlertModel } from '../models/alert.model';
import { AgentModel } from '../models/agent.model';

export const getAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { severity, status, source_type } = req.query;
    const alerts = await AlertModel.findAll({
      severity: severity as string,
      status: status as string,
      source_type: source_type as string,
    });
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const alert = await AlertModel.findById(req.params.id);
    if (!alert) {
      res.status(404).json({
        success: false,
        error: { message: 'Alert not found', code: 'NOT_FOUND' },
      });
      return;
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const updated = await AlertModel.update(req.params.id, {
      status,
      userId: req.user?.id,
    });
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: 'Alert not found', code: 'NOT_FOUND' },
      });
      return;
    }
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: `ALERT_${status.toUpperCase()}`,
      entity_type: 'alert',
      entity_id: updated.id,
      details: { status },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
