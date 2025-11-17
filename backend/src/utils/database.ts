import mongoose from 'mongoose';
import { User, NGO, Donation, Chat, Transaction } from '../models';
import { getDatabaseConfig } from '../config/database';
import { initGridFS } from '../middleware/upload';

export const connectDatabase = async (): Promise<void> => {
  try {
    const { uri, options } = getDatabaseConfig();
    
    await mongoose.connect(uri, options);
    
    console.log('✅ MongoDB connected successfully');
    
    // Initialize GridFS for file storage
    initGridFS();
    console.log('✅ GridFS initialized successfully');
    
    // Create indexes for performance optimization
    await createIndexes();
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};
/**
 * C
reate database indexes for performance optimization
 */
export const createIndexes = async (): Promise<void> => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ 'profile.address.coordinates': '2dsphere' });
    
    // NGO indexes
    await NGO.collection.createIndex({ userId: 1 }, { unique: true });
    await NGO.collection.createIndex({ registrationNumber: 1 }, { unique: true });
    await NGO.collection.createIndex({ verificationStatus: 1 });
    await NGO.collection.createIndex({ categories: 1 });
    await NGO.collection.createIndex({ verificationStatus: 1, categories: 1 });
    
    // Donation indexes
    await Donation.collection.createIndex({ donorId: 1 });
    await Donation.collection.createIndex({ status: 1 });
    await Donation.collection.createIndex({ category: 1 });
    await Donation.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Donation.collection.createIndex({ createdAt: -1 });
    await Donation.collection.createIndex({ foodExpiry: 1 });
    await Donation.collection.createIndex({ acceptedBy: 1 });
    await Donation.collection.createIndex({ status: 1, category: 1 });
    
    // Chat indexes
    await Chat.collection.createIndex({ donationId: 1 }, { unique: true });
    await Chat.collection.createIndex({ participants: 1 });
    await Chat.collection.createIndex({ lastMessageAt: -1 });
    
    // Transaction indexes
    await Transaction.collection.createIndex({ donationId: 1 });
    await Transaction.collection.createIndex({ donorId: 1 });
    await Transaction.collection.createIndex({ ngoId: 1 });
    await Transaction.collection.createIndex({ paymentGatewayId: 1 });
    await Transaction.collection.createIndex({ status: 1 });
    await Transaction.collection.createIndex({ createdAt: -1 });
    await Transaction.collection.createIndex({ paymentGateway: 1, status: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    // Don't throw error as indexes might already exist
  }
};

/**
 * Drop all indexes (useful for development/testing)
 */
export const dropIndexes = async (): Promise<void> => {
  try {
    console.log('🗑️ Dropping database indexes...');
    
    await User.collection.dropIndexes();
    await NGO.collection.dropIndexes();
    await Donation.collection.dropIndexes();
    await Chat.collection.dropIndexes();
    await Transaction.collection.dropIndexes();
    
    console.log('✅ Database indexes dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping database indexes:', error);
    throw error;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const collectionStats = await Promise.all(
      collections.map(async (collection) => {
        const collectionObj = mongoose.connection.db!.collection(collection.name);
        const count = await collectionObj.countDocuments();
        const indexes = await collectionObj.indexes();
        
        return {
          name: collection.name,
          documents: count,
          indexes: indexes.length
        };
      })
    );
    
    return {
      database: {
        name: mongoose.connection.name,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      },
      collections: collectionStats
    };
  } catch (error) {
    console.error('❌ Error getting database statistics:', error);
    throw error;
  }
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return state === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};