"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { stream, metadata } = await (0, upload_1.getFileFromGridFS)(fileId);
        res.set({
            'Content-Type': metadata.metadata?.contentType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${metadata.filename}"`,
            'Cache-Control': 'public, max-age=31536000'
        });
        stream.pipe(res);
    }
    catch (error) {
        if (error.message === 'Invalid file ID' || error.message === 'File not found') {
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
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=files.js.map