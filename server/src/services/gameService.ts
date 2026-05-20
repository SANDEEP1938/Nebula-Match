import type { Types } from 'mongoose';
import { GameSession } from '../models/GameSession.js';
import { User } from '../models/User.js';
import type { GameSubmitInput } from '../types/index.js';
import { AppError } from '../utils/AppError.js';
import { calculateScore, getPairCount } from '../utils/score.js';

export const submitGame = async (userId: Types.ObjectId, payload: GameSubmitInput) => {
  const { difficulty, moves, timeSeconds, pairsFound, completed } = payload;
  const totalPairs = getPairCount(difficulty);

  if (pairsFound > totalPairs) {
    throw new AppError('Invalid pairs found count', 400);
  }

  if (completed && pairsFound !== totalPairs) {
    throw new AppError('Completed games must match all pairs', 400);
  }

  const score = calculateScore({
    difficulty,
    moves,
    timeSeconds,
    completed,
  });

  const session = await GameSession.create({
    user: userId,
    difficulty,
    moves,
    timeSeconds,
    pairsFound,
    totalPairs,
    score,
    completed,
  });

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.gamesPlayed += 1;
  if (completed) {
    user.gamesWon += 1;
    user.totalScore += score;
    if (score > user.bestScore) {
      user.bestScore = score;
    }
  }
  await user.save();

  return {
    session: {
      id: session._id,
      difficulty: session.difficulty,
      moves: session.moves,
      timeSeconds: session.timeSeconds,
      pairsFound: session.pairsFound,
      totalPairs: session.totalPairs,
      score: session.score,
      completed: session.completed,
      createdAt: session.createdAt,
    },
    user: {
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      totalScore: user.totalScore,
      bestScore: user.bestScore,
    },
  };
};

export const getUserHistory = async (userId: Types.ObjectId, limit = 20) => {
  const sessions = await GameSession.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return sessions.map((s) => ({
    id: s._id,
    difficulty: s.difficulty,
    moves: s.moves,
    timeSeconds: s.timeSeconds,
    score: s.score,
    completed: s.completed,
    createdAt: s.createdAt,
  }));
};

export const getUserStats = async (userId: Types.ObjectId) => {
  const byDifficulty = await GameSession.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$difficulty',
        games: { $sum: 1 },
        wins: { $sum: { $cond: ['$completed', 1, 0] } },
        avgScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        avgMoves: { $avg: '$moves' },
      },
    },
  ]);

  return {
    byDifficulty: byDifficulty.map((d) => ({
      difficulty: d._id as string,
      games: d.games as number,
      wins: d.wins as number,
      avgScore: Math.round((d.avgScore as number) || 0),
      bestScore: (d.bestScore as number) || 0,
      avgMoves: Math.round((d.avgMoves as number) || 0),
    })),
  };
};
