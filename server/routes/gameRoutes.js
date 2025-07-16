import express from 'express';
import { getPlayerStats, updateRecentOpponents, getStatsHandler } from '../controllers/gameController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', verifyToken, getPlayerStats);
router.post('/opponent', verifyToken, updateRecentOpponents);
router.get('/stats', getStatsHandler);

export default router;
