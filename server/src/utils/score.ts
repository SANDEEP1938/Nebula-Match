import type { Difficulty, ScoreInput } from '../types/index.js';

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { pairs: number; base: number; movePenalty: number; timePenalty: number }
> = {
  easy: { pairs: 6, base: 600, movePenalty: 4, timePenalty: 2 },
  medium: { pairs: 8, base: 1000, movePenalty: 5, timePenalty: 3 },
  hard: { pairs: 10, base: 1500, movePenalty: 6, timePenalty: 4 },
};

export const getDifficultyConfig = (difficulty: Difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) {
    throw new Error('Invalid difficulty');
  }
  return config;
};

export const calculateScore = ({
  difficulty,
  moves,
  timeSeconds,
  completed,
}: ScoreInput): number => {
  const config = getDifficultyConfig(difficulty);
  if (!completed) {
    return 0;
  }
  const raw =
    config.base - moves * config.movePenalty - timeSeconds * config.timePenalty;
  return Math.max(100, Math.round(raw));
};

export const getPairCount = (difficulty: Difficulty): number =>
  getDifficultyConfig(difficulty).pairs;
