"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.deleteFileFromGridFS = exports.getFileFromGridFS = exports.uploadToGridFS = exports.uploadDocuments = exports.upload = exports.getGridFSBucket = exports.initGridFS = void 0;
const multer_1 = __importDefault(require("multer"));
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
let gfsBucket;
const initGridFS = () => {
    if (mongoose_1.default.connection.readyState === 1 && mongoose_1.default.connection.db) {
        gfsBucket = new mongodb_1.GridFSBucket(mongoose_1.default.connection.db, {
            bucketName: 'uploads'
        });
    }
};
exports.initGridFS = initGridFS;
const getGridFSBucket = () => {
    if (!gfsBucket) {
        (0, exports.initGridFS)();
    }
    return gfsBucket;
};
exports.getGridFSBucket = getGridFSBucket;
const storage = multer_1.default.memoryStorage();
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const documentFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (JPG, PNG, GIF) and PDF documents are allowed'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter: imageFileFilter
});
exports.uploadDocuments = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter: documentFileFilter
});
const uploadToGridFS = async (files) => {
    const bucket = (0, exports.getGridFSBucket)();
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(file.originalname, {
                metadata: {
                    contentType: file.mimetype,
                    uploadDate: new Date()
                }
            });
            uploadStream.on('error', reject);
            uploadStream.on('finish', () => {
                resolve(uploadStream.id.toString());
            });
            uploadStream.end(file.buffer);
        });
    });
    return Promise.all(uploadPromises);
};
exports.uploadToGridFS = uploadToGridFS;
const getFileFromGridFS = async (fileId) => {
    const bucket = (0, exports.getGridFSBucket)();
    if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID');
    }
    const objectId = new mongoose_1.default.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
        throw new Error('File not found');
    }
    const downloadStream = bucket.openDownloadStream(objectId);
    return {
        stream: downloadStream,
        metadata: files[0]
    };
};
exports.getFileFromGridFS = getFileFromGridFS;
const deleteFileFromGridFS = async (fileId) => {
    const bucket = (0, exports.getGridFSBucket)();
    if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID');
    }
    const objectId = new mongoose_1.default.Types.ObjectId(fileId);
    await bucket.delete(objectId);
};
exports.deleteFileFromGridFS = deleteFileFromGridFS;
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'File size too large',
                    details: 'Maximum file size is 5MB'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOO_MANY_FILES',
                    message: 'Too many files',
                    details: 'Maximum 5 files allowed'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: 'Invalid file type',
                details: 'Only image files are allowed'
            },
            timestamp: new Date().toISOString()
        });
    }
    if (err.message === 'Only image files (JPG, PNG, GIF) and PDF documents are allowed') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: 'Invalid file type',
                details: 'Only image files (JPG, PNG, GIF) and PDF documents are allowed'
            },
            timestamp: new Date().toISOString()
        });
    }
    return res.status(500).json({
        success: false,
        error: {
            code: 'UPLOAD_ERROR',
            message: 'File upload failed',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        },
        timestamp: new Date().toISOString()
    });
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map