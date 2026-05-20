export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SanitizedUser {
  id: string;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestScore: number;
  createdAt: Date;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface GameSubmitInput {
  difficulty: Difficulty;
  moves: number;
  timeSeconds: number;
  pairsFound: number;
  completed: boolean;
}

export interface ScoreInput {
  difficulty: Difficulty;
  moves: number;
  timeSeconds: number;
  completed: boolean;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}
