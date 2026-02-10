import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  logout,
  googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Google OAuth Route
router.post('/google', googleAuth);

export default router;