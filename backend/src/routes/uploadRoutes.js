import express from 'express';
import { uploadImages, deleteImage } from '../controllers/uploadController.js';
import upload from '../middlewares/upload.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/', uploadLimiter, upload.array('images', 5), uploadImages);
router.delete('/', deleteImage);

export default router;
