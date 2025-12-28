import express from 'express';
import {
  getAllBlacklist,
  getBlacklistById,
  createBlacklist,
  updateBlacklist,
  deleteBlacklist,
} from '../controllers/blacklistController.js';

const router = express.Router();

router.get('/', getAllBlacklist);
router.get('/:id', getBlacklistById);
router.post('/', createBlacklist);
router.put('/:id', updateBlacklist);
router.delete('/:id', deleteBlacklist);

export default router;
