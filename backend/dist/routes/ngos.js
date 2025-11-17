"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ngoController_1 = require("../controllers/ngoController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const rateLimiting_1 = require("../middleware/rateLimiting");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/register', rateLimiting_1.generalRateLimit, (0, auth_1.requireRole)(['ngo']), upload_1.uploadDocuments.fields([
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
]), upload_1.handleUploadError, validation_1.validateNGORegistration, ngoController_1.registerNGO);
router.get('/profile', ngoController_1.getNGOProfile);
router.put('/profile', rateLimiting_1.generalRateLimit, upload_1.uploadDocuments.fields([
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'tax_exemption', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'other', maxCount: 5 }
]), upload_1.handleUploadError, validation_1.validateNGOUpdate, ngoController_1.updateNGOProfile);
router.get('/verification-status', ngoController_1.getVerificationStatus);
router.get('/dashboard', (0, auth_1.requireRole)(['ngo']), ngoController_1.getNGODashboard);
router.get('/reports', (0, auth_1.requireRole)(['ngo']), ngoController_1.getNGOReports);
router.get('/reports/export', (0, auth_1.requireRole)(['ngo']), ngoController_1.exportNGOReports);
exports.default = router;
//# sourceMappingURL=ngos.js.map