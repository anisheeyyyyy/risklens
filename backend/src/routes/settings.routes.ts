import { Router } from 'express';
import { getSettings, updateSettings, reseedDatabase } from '../controllers/settings.controller';

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reseed', reseedDatabase);

export default router;
