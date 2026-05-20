import type { NextFunction, Request, Response } from 'express';
import { DIFFICULTY_LEVELS } from '../models/GameSession.js';
import * as gameService from '../services/gameService.js';
import type { Difficulty, GameSubmitInput } from '../types/index.js';
import { getPairCount } from '../utils/score.js';

export const getConfig = (_req: Request, res: Response): void => {
  const config = DIFFICULTY_LEVELS.map((difficulty) => ({
    difficulty,
    pairs: getPairCount(difficulty),
    gridCols: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5,
  }));
  res.json({ success: true, data: { difficulties: config } });
};

export const submit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const result = await gameService.submitGame(
      req.user._id,
      req.body as GameSubmitInput
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const history = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const sessions = await gameService.getUserHistory(req.user._id, limit);
    res.json({ success: true, data: { sessions } });
  } catch (err) {
    next(err);
  }
};

export const stats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const statsData = await gameService.getUserStats(req.user._id);
    res.json({ success: true, data: statsData });
  } catch (err) {
    next(err);
  }
};
