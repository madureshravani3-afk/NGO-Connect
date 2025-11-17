import { ConnectOptions } from 'mongoose';
export interface DatabaseConfig {
    uri: string;
    options: ConnectOptions;
}
export declare const getDatabaseConfig: () => DatabaseConfig;
export declare const getTestDatabaseConfig: () => DatabaseConfig;
export declare const databaseConstants: {
    COLLECTIONS: {
        USERS: string;
        NGOS: string;
        DONATIONS: string;
        CHATS: string;
        TRANSACTIONS: string;
    };
    INDEXES: {
        USER_EMAIL: string;
        USER_ROLE: string;
        USER_LOCATION: string;
        NGO_USER_ID: string;
        NGO_REGISTRATION: string;
        NGO_VERIFICATION: string;
        DONATION_LOCATION: string;
        DONATION_STATUS: string;
        DONATION_CATEGORY: string;
        CHAT_DONATION: string;
        TRANSACTION_PAYMENT_ID: string;
    };
    VALIDATION: {
        PASSWORD_MIN_LENGTH: number;
        PHONE_REGEX: RegExp;
        EMAIL_REGEX: RegExp;
        PINCODE_REGEX: RegExp;
        URL_REGEX: RegExp;
        MAX_FILE_SIZE: number;
        ALLOWED_IMAGE_TYPES: string[];
        ALLOWED_DOCUMENT_TYPES: string[];
    };
};
//# sourceMappingURL=database.d.ts.map