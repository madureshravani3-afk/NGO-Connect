"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./utils/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Donor-NGO Platform API is running',
        timestamp: new Date().toISOString()
    });
});
app.post('/api/seed', async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                error: 'Seeding only allowed in development'
            });
        }
        const { seedDatabase } = await Promise.resolve().then(() => __importStar(require('./utils/seedData')));
        await seedDatabase();
        return res.json({
            success: true,
            message: 'Database seeded successfully'
        });
    }
    catch (error) {
        console.error('Seeding error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to seed database',
            details: error.message
        });
    }
});
app.post('/api/reset-seed', async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                error: 'Database reset only allowed in development'
            });
        }
        const { clearDatabase, seedDatabase } = await Promise.resolve().then(() => __importStar(require('./utils/seedData')));
        await clearDatabase();
        await seedDatabase();
        return res.json({
            success: true,
            message: 'Database cleared and seeded successfully'
        });
    }
    catch (error) {
        console.error('Reset seeding error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to reset and seed database',
            details: error.message
        });
    }
});
const auth_1 = __importDefault(require("./routes/auth"));
const donations_1 = __importDefault(require("./routes/donations"));
const files_1 = __importDefault(require("./routes/files"));
const ngos_1 = __importDefault(require("./routes/ngos"));
const admin_1 = __importDefault(require("./routes/admin"));
app.use('/api/auth', auth_1.default);
app.use('/api/donations', donations_1.default);
app.use('/api/files', files_1.default);
app.use('/api/ngos', ngos_1.default);
app.use('/api/admin', admin_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong!',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        },
        timestamp: new Date().toISOString()
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
            details: `Cannot ${req.method} ${req.originalUrl}`
        },
        timestamp: new Date().toISOString()
    });
});
const startServer = async () => {
    try {
        try {
            await (0, database_1.connectDatabase)();
        }
        catch (dbError) {
            console.warn('⚠️ Database connection failed, starting server without database:', dbError.message);
            console.warn('⚠️ Some features may not work properly without database connection');
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`📋 Available endpoints:`);
            console.log(`   GET  /api/health - Health check`);
            console.log(`   POST /api/auth/register - User registration`);
            console.log(`   POST /api/auth/login - User login`);
            console.log(`   GET  /api/auth/profile - Get user profile (requires auth)`);
            console.log(`   PUT  /api/auth/profile - Update user profile (requires auth)`);
            console.log(`   POST /api/auth/forgot-password - Request password reset`);
            console.log(`   POST /api/auth/reset-password - Reset password`);
            console.log(`   POST /api/auth/logout - Logout (requires auth)`);
            console.log(`   GET  /api/auth/verify - Verify token (requires auth)`);
            console.log(`   GET  /api/donations/available - Search available donations (requires auth)`);
            console.log(`   GET  /api/donations/categories - Get donation categories (requires auth)`);
            console.log(`   GET  /api/donations/nearby - Get nearby donations (requires auth)`);
            console.log(`   POST /api/donations - Create donation (donors only)`);
            console.log(`   GET  /api/donations/my - Get my donations (donors only)`);
            console.log(`   GET  /api/donations/:id - Get donation by ID (requires auth)`);
            console.log(`   PUT  /api/donations/:id - Update donation (donors only)`);
            console.log(`   PATCH /api/donations/:id/status - Update donation status (donors/NGOs)`);
            console.log(`   GET  /api/donations/:id/timeline - Get donation timeline (requires auth)`);
            console.log(`   DELETE /api/donations/:id - Delete donation (donors only)`);
            console.log(`   GET  /api/files/:fileId - Get uploaded file`);
            console.log(`   POST /api/ngos/register - Register NGO (NGO role only)`);
            console.log(`   GET  /api/ngos/profile - Get NGO profile (requires auth)`);
            console.log(`   PUT  /api/ngos/profile - Update NGO profile (requires auth)`);
            console.log(`   GET  /api/ngos/verification-status - Get verification status (requires auth)`);
            console.log(`   GET  /api/admin/ngos/pending - Get pending NGO verifications (admin only)`);
            console.log(`   GET  /api/admin/ngos/:ngoId - Get NGO details for verification (admin only)`);
            console.log(`   POST /api/admin/ngos/:ngoId/verify - Verify NGO (admin only)`);
            console.log(`   POST /api/admin/ngos/:ngoId/reject - Reject NGO (admin only)`);
            console.log(`   PATCH /api/admin/ngos/:ngoId/badge - Update NGO badge (admin only)`);
            console.log(`   GET  /api/admin/stats/verification - Get verification statistics (admin only)`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map