import express from 'express';
import {
  getPendingNGOs,
  getNGODetails,
  verifyNGO,
  rejectNGO,
  getVerificationStats,
  updateNGOBadge,
  seedDatabase,
  getUsers,
  suspendUser,
  activateUser,
  getAnalytics,
  exportAnalytics
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiting';
import {
  validateNGOVerification,
  validateNGORejection,
  validateBadgeUpdate
} from '../middleware/validation';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Get pending NGO verifications with pagination and filtering
router.get('/ngos/pending', generalRateLimit, getPendingNGOs);

// Get NGO details for verification
router.get('/ngos/:ngoId', generalRateLimit, getNGODetails);

// Verify NGO (approve)
router.post('/ngos/:ngoId/verify', generalRateLimit, validateNGOVerification, verifyNGO);

// Reject NGO
router.post('/ngos/:ngoId/reject', generalRateLimit, validateNGORejection, rejectNGO);

// Update NGO badge
router.patch('/ngos/:ngoId/badge', generalRateLimit, validateBadgeUpdate, updateNGOBadge);

// Get verification statistics
router.get('/stats/verification', generalRateLimit, getVerificationStats);

// User management routes
router.get('/users', generalRateLimit, getUsers);
router.post('/users/:userId/suspend', generalRateLimit, suspendUser);
router.post('/users/:userId/activate', generalRateLimit, activateUser);

// Analytics routes
router.get('/analytics', generalRateLimit, getAnalytics);
router.get('/analytics/export', generalRateLimit, exportAnalytics);

// Seed database (development only)
router.post('/seed', generalRateLimit, seedDatabase);

export default router;