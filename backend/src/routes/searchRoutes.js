import express from 'express';
import { searchUrl, bulkSearchUrls } from '../controllers/searchController.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/check', searchLimiter, searchUrl);
router.post('/bulk-check', searchLimiter, bulkSearchUrls);

export default router;
