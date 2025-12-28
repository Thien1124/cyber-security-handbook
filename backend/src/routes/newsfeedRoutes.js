import express from 'express';
import {
  getNewsfeed,
  getTopScams,
  getScamsByType,
} from '../controllers/newsfeedController.js';

const router = express.Router();

router.get('/', getNewsfeed);
router.get('/top', getTopScams);
router.get('/by-type', getScamsByType);

export default router;
