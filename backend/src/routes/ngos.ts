import express from 'express';
import {
  registerNGO,
  getNGOProfile,
  updateNGOProfile,
  getVerificationStatus,
  getNGODashboard,
  getNGOReports,
  exportNGOReports
} from '../controllers/ngoController';
import {
  validateNGORegistration,
  validateNGOUpdate
} from '../middleware/validation';
import { authenticateToken, requireRole } from '../middleware/auth';
import { uploadDocuments, handleUploadError } from '../middleware/upload';
import { generalRateLimit } from '../middleware/rateLimiting';

const router = express.Router();

// All NGO routes require authentication
router.use(authenticateToken);

// NGO registration route - only for users with 'ngo' role
router.post('/register', 
  generalRateLimit,
  requireRole(['ngo']),
  uploadDocuments.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'organizationName', maxCount: 1 },
    { name: 'registrationNumber', maxCount: 1 },
    { name: 'categories', maxCount: 1 },
    { name: 'pickupService', maxCount: 1 },
    { name: 'serviceRadius', maxCount: 1 },
    { name: 'description', maxCount: 1 },
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'tax_exemption', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'other', maxCount: 5 }
  ]),
  handleUploadError,
  validateNGORegistration,
  registerNGO
);

// Get NGO profile
router.get('/profile', getNGOProfile);

// Update NGO profile
router.put('/profile',
  generalRateLimit,
  uploadDocuments.fields([
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'tax_exemption', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'other', maxCount: 5 }
  ]),
  handleUploadError,
  validateNGOUpdate,
  updateNGOProfile
);

// Get verification status
router.get('/verification-status', getVerificationStatus);

// NGO dashboard data
router.get('/dashboard', requireRole(['ngo']), getNGODashboard);

// NGO reports
router.get('/reports', requireRole(['ngo']), getNGOReports);
router.get('/reports/export', requireRole(['ngo']), exportNGOReports);

export default router;