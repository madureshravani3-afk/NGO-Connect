"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const router = express_1.default.Router();
router.post('/register', rateLimiting_1.authRateLimit, validation_1.validateRegistration, authController_1.register);
router.post('/login', rateLimiting_1.authRateLimit, validation_1.validateLogin, authController_1.login);
router.post('/forgot-password', rateLimiting_1.passwordResetRateLimit, validation_1.validatePasswordReset, authController_1.requestPasswordReset);
router.post('/reset-password', rateLimiting_1.authRateLimit, validation_1.validateNewPassword, authController_1.resetPassword);
router.use(auth_1.authenticateToken);
router.get('/profile', authController_1.getProfile);
router.put('/profile', validation_1.validateProfileUpdate, authController_1.updateProfile);
router.post('/logout', authController_1.logout);
router.get('/verify', authController_1.verifyToken);
exports.default = router;
//# sourceMappingURL=auth.js.map