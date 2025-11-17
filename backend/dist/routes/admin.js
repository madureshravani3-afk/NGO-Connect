"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['admin']));
router.get('/ngos/pending', rateLimiting_1.generalRateLimit, adminController_1.getPendingNGOs);
router.get('/ngos/:ngoId', rateLimiting_1.generalRateLimit, adminController_1.getNGODetails);
router.post('/ngos/:ngoId/verify', rateLimiting_1.generalRateLimit, validation_1.validateNGOVerification, adminController_1.verifyNGO);
router.post('/ngos/:ngoId/reject', rateLimiting_1.generalRateLimit, validation_1.validateNGORejection, adminController_1.rejectNGO);
router.patch('/ngos/:ngoId/badge', rateLimiting_1.generalRateLimit, validation_1.validateBadgeUpdate, adminController_1.updateNGOBadge);
router.get('/stats/verification', rateLimiting_1.generalRateLimit, adminController_1.getVerificationStats);
router.get('/users', rateLimiting_1.generalRateLimit, adminController_1.getUsers);
router.post('/users/:userId/suspend', rateLimiting_1.generalRateLimit, adminController_1.suspendUser);
router.post('/users/:userId/activate', rateLimiting_1.generalRateLimit, adminController_1.activateUser);
router.get('/analytics', rateLimiting_1.generalRateLimit, adminController_1.getAnalytics);
router.get('/analytics/export', rateLimiting_1.generalRateLimit, adminController_1.exportAnalytics);
router.post('/seed', rateLimiting_1.generalRateLimit, adminController_1.seedDatabase);
exports.default = router;
//# sourceMappingURL=admin.js.map