import express from 'express';
import {
  createReport,
  getReportStatus,
  getUserReports,
} from '../controllers/reportController.js';
import { reportValidation } from '../middlewares/validation.js';
import { reportLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/', reportLimiter, reportValidation, createReport);
router.get('/status/:reportId', getReportStatus);
router.get('/user', getUserReports);

export default router;
