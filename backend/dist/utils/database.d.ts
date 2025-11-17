export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const createIndexes: () => Promise<void>;
export declare const dropIndexes: () => Promise<void>;
export declare const getDatabaseStats: () => Promise<{
    database: {
        name: string;
        collections: any;
        objects: any;
        dataSize: any;
        storageSize: any;
        indexes: any;
        indexSize: any;
    };
    collections: {
        name: string;
        documents: number;
        indexes: number;
    }[];
}>;
export declare const checkDatabaseHealth: () => Promise<boolean>;
//# sourceMappingURL=database.d.ts.map