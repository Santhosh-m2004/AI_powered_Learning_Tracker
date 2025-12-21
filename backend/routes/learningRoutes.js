import express from 'express';
import { 
  createSession, 
  getSessions, 
  getStats, 
  updateSession, 
  deleteSession 
} from '../controllers/learningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/sessions')
  .post(protect, createSession)
  .get(protect, getSessions);

router.get('/stats', protect, getStats);

router.route('/sessions/:id')
  .put(protect, updateSession)
  .delete(protect, deleteSession);

export default router;