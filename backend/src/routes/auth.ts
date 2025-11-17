import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  logout,
  verifyToken
} from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordReset,
  validateNewPassword
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { authRateLimit, passwordResetRateLimit } from '../middleware/rateLimiting';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authRateLimit, validateRegistration, register);
router.post('/login', authRateLimit, validateLogin, login);
router.post('/forgot-password', passwordResetRateLimit, validatePasswordReset, requestPasswordReset);
router.post('/reset-password', authRateLimit, validateNewPassword, resetPassword);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below this middleware require authentication

router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.post('/logout', logout);
router.get('/verify', verifyToken);

export default router;