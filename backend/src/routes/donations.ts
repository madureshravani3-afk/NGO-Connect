import express from 'express';
import { 
  createDonation, 
  getDonorDonations, 
  getDonationById, 
  updateDonation, 
  deleteDonation,
  updateDonationStatus,
  getDonationTimeline,
  getAvailableDonations,
  getDonationCategories,
  getNearbyDonations,
  acceptDonation,
  rejectDonation
} from '../controllers/donationController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateDonation } from '../middleware/validation';
import { upload, handleUploadError } from '../middleware/upload';

const router = express.Router();

// Get available donations with search and filtering (accessible to all authenticated users)
router.get(
  '/available',
  authenticateToken,
  getAvailableDonations
);

// Get donation categories with counts (accessible to all authenticated users)
router.get(
  '/categories',
  authenticateToken,
  getDonationCategories
);

// Get nearby donations (accessible to all authenticated users)
router.get(
  '/nearby',
  authenticateToken,
  getNearbyDonations
);

// Create a new donation (donors only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('donor'),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'title', maxCount: 1 },
    { name: 'description', maxCount: 1 },
    { name: 'category', maxCount: 1 },
    { name: 'quantity', maxCount: 1 },
    { name: 'location', maxCount: 1 },
    { name: 'pickupOption', maxCount: 1 },
    { name: 'foodExpiry', maxCount: 1 },
    { name: 'amount', maxCount: 1 },
    { name: 'urgency', maxCount: 1 }
  ]),
  handleUploadError,
  validateDonation,
  createDonation
);

// Get donations by authenticated donor
router.get(
  '/my',
  authenticateToken,
  authorizeRoles('donor'),
  getDonorDonations
);

// Get donation by ID (accessible to all authenticated users)
router.get(
  '/:id',
  authenticateToken,
  getDonationById
);

// Update donation (donors only, own donations)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('donor'),
  validateDonation,
  updateDonation
);

// Update donation status (donors and NGOs)
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('donor', 'ngo'),
  updateDonationStatus
);

// Get donation timeline/history
router.get(
  '/:id/timeline',
  authenticateToken,
  getDonationTimeline
);

// Accept donation (NGOs only)
router.post(
  '/:id/accept',
  authenticateToken,
  authorizeRoles('ngo'),
  acceptDonation
);

// Reject donation (NGOs only)
router.post(
  '/:id/reject',
  authenticateToken,
  authorizeRoles('ngo'),
  rejectDonation
);

// Delete donation (donors only, own donations)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('donor'),
  deleteDonation
);

export default router;