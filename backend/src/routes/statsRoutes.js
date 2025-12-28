import express from 'express';
import {
  getStatistics,
  getTrendingScams,
  getReportStats,
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getStatistics);
router.get('/trending', getTrendingScams);
router.get('/reports', getReportStats);

export default router;
