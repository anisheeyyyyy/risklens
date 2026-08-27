import { Router } from 'express';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../controllers/assets.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/assets — Create Asset (smart assessment)
 *
 * Users submit factual attributes only.
 * criticality and risk_level are NEVER accepted from the client —
 * they are calculated by AssetRiskEngine in the controller.
 */
const createAssetSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  asset_type: z.enum(['server', 'endpoint', 'cloud-resource', 'network-device', 'database', 'application']),
  // Factual attributes — drive automatic assessment
  environment: z.enum(['Production', 'Staging', 'Development', 'Sandbox']).default('Production'),
  internet_exposed: z.boolean().default(false),
  contains_sensitive_data: z.boolean().default(false),
  business_importance: z.enum(['Critical', 'High', 'Medium', 'Low']).default('Medium'),
  // Optional metadata
  ip_address: z.string().optional(),
  hostname: z.string().optional(),
  owner: z.string().optional(),
  status: z.enum(['Active', 'Under Maintenance', 'Isolated', 'Decommissioned']).optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateAssetSchema = createAssetSchema.partial();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', validateBody(createAssetSchema), createAsset);
router.put('/:id', validateBody(updateAssetSchema), updateAsset);
router.delete('/:id', deleteAsset);

export default router;
