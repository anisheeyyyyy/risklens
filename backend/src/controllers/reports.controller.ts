import { Request, Response, NextFunction } from 'express';
import { SecurityReportAgent } from '../agents/securityReportAgent';
import { AgentModel } from '../models/agent.model';

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await SecurityReportAgent.run({ reportType: 'executive' });
    res.json({
      success: true,
      data: [
        report,
        await SecurityReportAgent.run({ reportType: 'vulnerability' }),
        await SecurityReportAgent.run({ reportType: 'threat' }),
        await SecurityReportAgent.run({ reportType: 'compliance' }),
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reportType = (typeof req.body === 'string' ? req.body : req.body?.reportType) || 'executive';
    const report = await SecurityReportAgent.run({ reportType });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
