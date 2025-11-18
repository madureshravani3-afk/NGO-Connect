import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './utils/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NGOConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Seed database route (development only)
app.post('/api/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'Seeding only allowed in development'
      });
    }

    const { seedDatabase } = await import('./utils/seedData');
    await seedDatabase();

    return res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: (error as Error).message
    });
  }
});

// Clear and reseed database route (development only)
app.post('/api/reset-seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'Database reset only allowed in development'
      });
    }

    const { clearDatabase, seedDatabase } = await import('./utils/seedData');
    await clearDatabase();
    await seedDatabase();

    return res.json({
      success: true,
      message: 'Database cleared and seeded successfully'
    });
  } catch (error) {
    console.error('Reset seeding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset and seed database',
      details: (error as Error).message
    });
  }
});

// Import routes
import authRoutes from './routes/auth';
import donationRoutes from './routes/donations';
import fileRoutes from './routes/files';
import ngoRoutes from './routes/ngos';
import adminRoutes from './routes/admin';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// 404 handler - must be last
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

// Start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await connectDatabase();
    } catch (dbError) {
      console.warn('⚠️ Database connection failed, starting server without database:', (dbError as Error).message);
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
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();