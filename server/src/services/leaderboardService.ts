import { GameSession, isDifficulty } from '../models/GameSession.js';
import type { Difficulty } from '../types/index.js';

export const getGlobalLeaderboard = async ({
  difficulty,
  limit = 10,
}: {
  difficulty?: string;
  limit?: number;
}) => {
  const match: { completed: boolean; difficulty?: Difficulty } = { completed: true };
  if (difficulty && isDifficulty(difficulty)) {
    match.difficulty = difficulty;
  }

  const entries = await GameSession.aggregate([
    { $match: match },
    { $sort: { score: -1, timeSeconds: 1, createdAt: -1 } },
    {
      $group: {
        _id: '$user',
        bestScore: { $first: '$score' },
        bestTime: { $first: '$timeSeconds' },
        bestMoves: { $first: '$moves' },
        difficulty: { $first: '$difficulty' },
        achievedAt: { $first: '$createdAt' },
      },
    },
    { $sort: { bestScore: -1, bestTime: 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$user.username',
        bestScore: 1,
        bestTime: 1,
        bestMoves: 1,
        difficulty: 1,
        achievedAt: 1,
      },
    },
  ]);

  return entries.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

export const getRecentWins = async (limit = 10) => {
  const sessions = await GameSession.find({ completed: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username')
    .lean();

  return sessions.map((s) => ({
    id: s._id,
    username:
      s.user && typeof s.user === 'object' && 'username' in s.user
        ? (s.user as { username: string }).username
        : 'Unknown',
    difficulty: s.difficulty,
    score: s.score,
    moves: s.moves,
    timeSeconds: s.timeSeconds,
    createdAt: s.createdAt,
  }));
};
