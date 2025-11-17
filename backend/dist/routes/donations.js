"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const donationController_1 = require("../controllers/donationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get('/available', auth_1.authenticateToken, donationController_1.getAvailableDonations);
router.get('/categories', auth_1.authenticateToken, donationController_1.getDonationCategories);
router.get('/nearby', auth_1.authenticateToken, donationController_1.getNearbyDonations);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('donor'), upload_1.upload.fields([
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
]), upload_1.handleUploadError, validation_1.validateDonation, donationController_1.createDonation);
router.get('/my', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('donor'), donationController_1.getDonorDonations);
router.get('/:id', auth_1.authenticateToken, donationController_1.getDonationById);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('donor'), validation_1.validateDonation, donationController_1.updateDonation);
router.patch('/:id/status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('donor', 'ngo'), donationController_1.updateDonationStatus);
router.get('/:id/timeline', auth_1.authenticateToken, donationController_1.getDonationTimeline);
router.post('/:id/accept', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ngo'), donationController_1.acceptDonation);
router.post('/:id/reject', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ngo'), donationController_1.rejectDonation);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('donor'), donationController_1.deleteDonation);
exports.default = router;
//# sourceMappingURL=donations.js.map