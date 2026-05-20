import { Router } from 'express';
import { body } from 'express-validator';
import { getConfig, history, stats, submit } from '../controllers/gameController.js';
import { DIFFICULTY_LEVELS } from '../models/GameSession.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/config', getConfig);

router.use(protect);

router.post(
  '/submit',
  [
    body('difficulty').isIn(DIFFICULTY_LEVELS).withMessage('Invalid difficulty'),
    body('moves').isInt({ min: 0 }).withMessage('Moves must be a non-negative integer'),
    body('timeSeconds').isInt({ min: 0 }).withMessage('Time must be a non-negative integer'),
    body('pairsFound').isInt({ min: 0 }).withMessage('Pairs found must be non-negative'),
    body('completed').isBoolean().withMessage('Completed must be boolean'),
  ],
  validate,
  submit
);

router.get('/history', history);
router.get('/stats', stats);

export default router;
