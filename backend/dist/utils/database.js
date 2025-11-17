"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = exports.getDatabaseStats = exports.dropIndexes = exports.createIndexes = exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const database_1 = require("../config/database");
const upload_1 = require("../middleware/upload");
const connectDatabase = async () => {
    try {
        const { uri, options } = (0, database_1.getDatabaseConfig)();
        await mongoose_1.default.connect(uri, options);
        console.log('✅ MongoDB connected successfully');
        (0, upload_1.initGridFS)();
        console.log('✅ GridFS initialized successfully');
        await (0, exports.createIndexes)();
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ MongoDB disconnected successfully');
    }
    catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
const createIndexes = async () => {
    try {
        console.log('🔍 Creating database indexes...');
        await models_1.User.collection.createIndex({ email: 1 }, { unique: true });
        await models_1.User.collection.createIndex({ role: 1 });
        await models_1.User.collection.createIndex({ 'profile.address.coordinates': '2dsphere' });
        await models_1.NGO.collection.createIndex({ userId: 1 }, { unique: true });
        await models_1.NGO.collection.createIndex({ registrationNumber: 1 }, { unique: true });
        await models_1.NGO.collection.createIndex({ verificationStatus: 1 });
        await models_1.NGO.collection.createIndex({ categories: 1 });
        await models_1.NGO.collection.createIndex({ verificationStatus: 1, categories: 1 });
        await models_1.Donation.collection.createIndex({ donorId: 1 });
        await models_1.Donation.collection.createIndex({ status: 1 });
        await models_1.Donation.collection.createIndex({ category: 1 });
        await models_1.Donation.collection.createIndex({ 'location.coordinates': '2dsphere' });
        await models_1.Donation.collection.createIndex({ createdAt: -1 });
        await models_1.Donation.collection.createIndex({ foodExpiry: 1 });
        await models_1.Donation.collection.createIndex({ acceptedBy: 1 });
        await models_1.Donation.collection.createIndex({ status: 1, category: 1 });
        await models_1.Chat.collection.createIndex({ donationId: 1 }, { unique: true });
        await models_1.Chat.collection.createIndex({ participants: 1 });
        await models_1.Chat.collection.createIndex({ lastMessageAt: -1 });
        await models_1.Transaction.collection.createIndex({ donationId: 1 });
        await models_1.Transaction.collection.createIndex({ donorId: 1 });
        await models_1.Transaction.collection.createIndex({ ngoId: 1 });
        await models_1.Transaction.collection.createIndex({ paymentGatewayId: 1 });
        await models_1.Transaction.collection.createIndex({ status: 1 });
        await models_1.Transaction.collection.createIndex({ createdAt: -1 });
        await models_1.Transaction.collection.createIndex({ paymentGateway: 1, status: 1 });
        console.log('✅ Database indexes created successfully');
    }
    catch (error) {
        console.error('❌ Error creating database indexes:', error);
    }
};
exports.createIndexes = createIndexes;
const dropIndexes = async () => {
    try {
        console.log('🗑️ Dropping database indexes...');
        await models_1.User.collection.dropIndexes();
        await models_1.NGO.collection.dropIndexes();
        await models_1.Donation.collection.dropIndexes();
        await models_1.Chat.collection.dropIndexes();
        await models_1.Transaction.collection.dropIndexes();
        console.log('✅ Database indexes dropped successfully');
    }
    catch (error) {
        console.error('❌ Error dropping database indexes:', error);
        throw error;
    }
};
exports.dropIndexes = dropIndexes;
const getDatabaseStats = async () => {
    try {
        if (!mongoose_1.default.connection.db) {
            throw new Error('Database connection not established');
        }
        const stats = await mongoose_1.default.connection.db.stats();
        const collections = await mongoose_1.default.connection.db.listCollections().toArray();
        const collectionStats = await Promise.all(collections.map(async (collection) => {
            const collectionObj = mongoose_1.default.connection.db.collection(collection.name);
            const count = await collectionObj.countDocuments();
            const indexes = await collectionObj.indexes();
            return {
                name: collection.name,
                documents: count,
                indexes: indexes.length
            };
        }));
        return {
            database: {
                name: mongoose_1.default.connection.name,
                collections: stats.collections,
                objects: stats.objects,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize
            },
            collections: collectionStats
        };
    }
    catch (error) {
        console.error('❌ Error getting database statistics:', error);
        throw error;
    }
};
exports.getDatabaseStats = getDatabaseStats;
const checkDatabaseHealth = async () => {
    try {
        const state = mongoose_1.default.connection.readyState;
        return state === 1;
    }
    catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
//# sourceMappingURL=database.js.map