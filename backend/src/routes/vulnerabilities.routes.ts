import { Router } from 'express';
import {
  getVulnerabilities,
  getVulnerabilityById,
  createVulnerability,
  updateVulnerability,
  getVulnerabilityRemediation,
} from '../controllers/vulnerabilities.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createVulnSchema = z.object({
  cve_id: z.string().min(3),
  title: z.string().min(3),
  description: z.string().min(5),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
  cvss_score: z.number().min(0).max(10),
  asset_id: z.string().min(1),
  remediation_guidance: z.string().optional(),
  remediation_priority: z.string().optional(),
});

const updateVulnSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  cvss_score: z.number().min(0).max(10).optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Risk Accepted']).optional(),
  remediation_guidance: z.string().optional(),
  remediation_priority: z.string().optional(),
});

router.get('/', getVulnerabilities);
router.get('/:id', getVulnerabilityById);
router.post('/', validateBody(createVulnSchema), createVulnerability);
router.put('/:id', validateBody(updateVulnSchema), updateVulnerability);
router.get('/:id/remediation', getVulnerabilityRemediation);

export default router;
