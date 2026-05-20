import mongoose, { Schema } from 'mongoose';
import type { Difficulty } from '../types/index.js';

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

const gameSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
    },
    moves: { type: Number, required: true, min: 0 },
    timeSeconds: { type: Number, required: true, min: 0 },
    pairsFound: { type: Number, required: true, min: 0 },
    totalPairs: { type: Number, required: true, min: 1 },
    score: { type: Number, required: true, min: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

gameSessionSchema.index({ score: -1, createdAt: -1 });
gameSessionSchema.index({ user: 1, createdAt: -1 });

export const GameSession = mongoose.model('GameSession', gameSessionSchema);

export const isDifficulty = (value: string): value is Difficulty =>
  (DIFFICULTY_LEVELS as readonly string[]).includes(value);
