import express from 'express';
import { 
  getInsights, 
  generateStudyPlan, 
  analyzeWeakSubjects 
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/insights', protect, getInsights);
router.post('/generate-plan', protect, generateStudyPlan);
router.get('/weak-subjects', protect, analyzeWeakSubjects);

export default router;