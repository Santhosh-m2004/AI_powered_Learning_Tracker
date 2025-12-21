import express from 'express';
import { 
  getUsers, 
  getAnalytics, 
  getUserDetails, 
  updateUserRole 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/users', getUsers);
router.get('/analytics', getAnalytics);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/role', updateUserRole);

export default router;