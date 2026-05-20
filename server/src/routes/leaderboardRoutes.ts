import { Router } from 'express';
import { globalBoard, recent } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/', globalBoard);
router.get('/recent', recent);

export default router;
