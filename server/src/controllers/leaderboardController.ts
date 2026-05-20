import type { NextFunction, Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboardService.js';

export const globalBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const difficulty =
      typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;
    const entries = await leaderboardService.getGlobalLeaderboard({
      difficulty,
      limit,
    });
    res.json({ success: true, data: { entries } });
  } catch (err) {
    next(err);
  }
};

export const recent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 30);
    const wins = await leaderboardService.getRecentWins(limit);
    res.json({ success: true, data: { wins } });
  } catch (err) {
    next(err);
  }
};
