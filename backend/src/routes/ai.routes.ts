import { Router } from 'express';
import {
  getInsights,
  triggerFullAnalysis,
  getAgentTasks,
  runAgentPipeline,
  approveAgentTask,
  rejectAgentTask,
} from '../controllers/ai.controller';

const router = Router();

// AI Insights and Analytics
router.get('/insights', getInsights);
router.post('/analyze', triggerFullAnalysis);

// Agent Tasks and Pipeline Execution
router.get('/tasks', getAgentTasks);
router.post('/run', runAgentPipeline);
router.post('/tasks/:id/approve', approveAgentTask);
router.post('/tasks/:id/reject', rejectAgentTask);

export default router;
