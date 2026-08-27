import { Router } from 'express';
import { getReports, generateReport } from '../controllers/reports.controller';

const router = Router();

router.get('/', getReports);
router.post('/generate', generateReport);

export default router;
