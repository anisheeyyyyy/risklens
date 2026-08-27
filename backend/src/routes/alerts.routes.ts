import { Router } from 'express';
import { getAlerts, getAlertById, updateAlert } from '../controllers/alerts.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const updateAlertSchema = z.object({
  status: z.enum(['Open', 'Acknowledged', 'Resolved', 'Dismissed']),
});

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.put('/:id', validateBody(updateAlertSchema), updateAlert);

export default router;
