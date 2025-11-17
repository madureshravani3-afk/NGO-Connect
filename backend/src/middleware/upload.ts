import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// GridFS bucket for file storage
let gfsBucket: GridFSBucket;

// Initialize GridFS bucket
export const initGridFS = () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }
};

// Get GridFS bucket
export const getGridFSBucket = (): GridFSBucket => {
  if (!gfsBucket) {
    initGridFS();
  }
  return gfsBucket;
};

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// File filter for documents (images and PDFs)
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type - allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, GIF) and PDF documents are allowed'));
  }
};

// Multer upload configuration for images
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: imageFileFilter
});

// Multer upload configuration for documents (NGO registration)
export const uploadDocuments = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    files: 10 // Maximum 10 files for NGO documents
  },
  fileFilter: documentFileFilter
});

// Upload files to GridFS
export const uploadToGridFS = async (files: Express.Multer.File[]): Promise<string[]> => {
  const bucket = getGridFSBucket();
  const uploadPromises = files.map((file) => {
    return new Promise<string>((resolve, reject) => {
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

// Get file from GridFS
export const getFileFromGridFS = async (fileId: string): Promise<{ stream: any; metadata: any }> => {
  const bucket = getGridFSBucket();
  
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error('Invalid file ID');
  }

  const objectId = new mongoose.Types.ObjectId(fileId);
  
  // Check if file exists
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

// Delete file from GridFS
export const deleteFileFromGridFS = async (fileId: string): Promise<void> => {
  const bucket = getGridFSBucket();
  
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error('Invalid file ID');
  }

  const objectId = new mongoose.Types.ObjectId(fileId);
  await bucket.delete(objectId);
};

// Middleware to handle file upload errors
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
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