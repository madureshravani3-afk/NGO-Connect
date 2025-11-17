import express from 'express';
import { getFileFromGridFS } from '../middleware/upload';

const router = express.Router();

// Get file by ID from GridFS
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const { stream, metadata } = await getFileFromGridFS(fileId);
    
    // Set appropriate headers
    res.set({
      'Content-Type': metadata.metadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${metadata.filename}"`,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });
    
    // Pipe the file stream to response
    stream.pipe(res);
    
  } catch (error) {
    if ((error as Error).message === 'Invalid file ID' || (error as Error).message === 'File not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found',
          details: 'The requested file does not exist'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FILE_RETRIEVAL_FAILED',
        message: 'Failed to retrieve file',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
});

export default router;