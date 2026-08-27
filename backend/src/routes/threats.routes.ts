import { Router } from 'express';
import {
  getThreats,
  getThreatById,
  createThreat,
  updateThreat,
  investigateThreat,
  proposeThreatResponse,
} from '../controllers/threats.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createThreatSchema = z.object({
  threat_name: z.string().min(3),
  threat_type: z.string().min(2),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
  source: z.string().min(2),
  asset_id: z.string().optional(),
  status: z.enum(['Active', 'Investigating', 'Mitigated', 'Contained', 'Dismissed']).optional(),
  indicator_of_compromise: z.string().optional(),
  tactics_techniques: z.array(z.string()).optional(),
  description: z.string().min(5),
});

const updateThreatSchema = createThreatSchema.partial();

router.get('/', getThreats);
router.get('/:id', getThreatById);
router.post('/', validateBody(createThreatSchema), createThreat);
router.put('/:id', validateBody(updateThreatSchema), updateThreat);
router.post('/:id/investigate', investigateThreat);
router.post('/:id/propose-response', proposeThreatResponse);

export default router;
