import { Request, Response, NextFunction } from 'express';
import { SettingsModel } from '../models/settings.model';
import { AgentModel } from '../models/agent.model';
import { isInMemory } from '../config/database';
import fs from 'fs';
import path from 'path';
import { query } from '../config/database';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await SettingsModel.get();
    res.json({
      success: true,
      data: {
        ...settings,
        engine_mode: isInMemory() ? 'Embedded In-Memory PostgreSQL' : 'Live PostgreSQL Cluster',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await SettingsModel.update(req.body);
    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'SETTINGS_UPDATED',
      entity_type: 'settings',
      entity_id: 'default',
      details: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const reseedDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath) && fs.existsSync(seedPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await query(schemaSql);
      await query(seedSql);
    }

    await AgentModel.logAudit({
      user_id: req.user?.id,
      action: 'DATABASE_RESEEDED',
      entity_type: 'database',
      entity_id: 'risklens',
      details: { timestamp: new Date().toISOString() },
    });

    res.json({
      success: true,
      data: { message: 'Database successfully reseeded with demonstration dataset.' },
    });
  } catch (error) {
    next(error);
  }
};
