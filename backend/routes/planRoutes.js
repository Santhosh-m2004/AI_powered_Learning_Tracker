import express from 'express';
import { 
  createPlan, 
  getPlans, 
  getPlanById, 
  updateTaskCompletion, 
  updatePlan, 
  deletePlan, 
  getTodayPlan 
} from '../controllers/planController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPlan)
  .get(protect, getPlans);

router.get('/today', protect, getTodayPlan);
router.get('/:id', protect, getPlanById);

router.route('/:id')
  .put(protect, updatePlan)
  .delete(protect, deletePlan);

router.put('/:id/tasks/:taskId', protect, updateTaskCompletion);

export default router;