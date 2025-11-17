"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConstants = exports.getTestDatabaseConfig = exports.getDatabaseConfig = void 0;
const getDatabaseConfig = () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const options = {
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
        minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2'),
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
        connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
        heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY || '10000'),
        bufferCommands: process.env.DB_BUFFER_COMMANDS === 'true',
        retryWrites: process.env.DB_RETRY_WRITES !== 'false',
        retryReads: process.env.DB_RETRY_READS !== 'false',
        compressors: process.env.DB_COMPRESSORS ?
            process.env.DB_COMPRESSORS.split(',') :
            ['zlib'],
        readPreference: process.env.DB_READ_PREFERENCE || 'primary'
    };
    return {
        uri: mongoUri,
        options
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
const getTestDatabaseConfig = () => {
    const testUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
    if (!testUri) {
        throw new Error('MONGODB_TEST_URI or MONGODB_URI is not defined in environment variables');
    }
    return {
        uri: testUri,
        options: {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 30000,
            bufferCommands: false
        }
    };
};
exports.getTestDatabaseConfig = getTestDatabaseConfig;
exports.databaseConstants = {
    COLLECTIONS: {
        USERS: 'users',
        NGOS: 'ngos',
        DONATIONS: 'donations',
        CHATS: 'chats',
        TRANSACTIONS: 'transactions'
    },
    INDEXES: {
        USER_EMAIL: 'user_email_unique',
        USER_ROLE: 'user_role',
        USER_LOCATION: 'user_location_2dsphere',
        NGO_USER_ID: 'ngo_user_id_unique',
        NGO_REGISTRATION: 'ngo_registration_unique',
        NGO_VERIFICATION: 'ngo_verification_status',
        DONATION_LOCATION: 'donation_location_2dsphere',
        DONATION_STATUS: 'donation_status',
        DONATION_CATEGORY: 'donation_category',
        CHAT_DONATION: 'chat_donation_unique',
        TRANSACTION_PAYMENT_ID: 'transaction_payment_id'
    },
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        PHONE_REGEX: /^[+]?[\d\s-()]+$/,
        EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        PINCODE_REGEX: /^\d{6}$/,
        URL_REGEX: /^https?:\/\/.+/,
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png']
    }
};
//# sourceMappingURL=database.js.map