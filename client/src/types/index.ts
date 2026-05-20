export type Difficulty = 'easy' | 'medium' | 'hard';

export interface User {
  id: string;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestScore: number;
  createdAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface Card {
  id: string;
  symbol: string;
  pairId: number;
  index: number;
  matched: boolean;
  flipped: boolean;
}

export interface GameState {
  difficulty: Difficulty;
  cards: Card[];
  moves: number;
  pairsFound: number;
  totalPairs: number;
  lockBoard: boolean;
  completed: boolean;
  startedAt: number | null;
  elapsedSeconds: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  bestScore: number;
  bestTime: number;
  bestMoves: number;
  difficulty: Difficulty;
  achievedAt: string;
}

export interface RecentWin {
  id: string;
  username: string;
  difficulty: Difficulty;
  score: number;
  moves: number;
  timeSeconds: number;
  createdAt: string;
}

export interface GameSessionSummary {
  id: string;
  difficulty: Difficulty;
  moves: number;
  timeSeconds: number;
  score: number;
  completed: boolean;
  createdAt: string;
}

export interface DifficultyStats {
  difficulty: Difficulty;
  games: number;
  wins: number;
  avgScore: number;
  bestScore: number;
  avgMoves: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
