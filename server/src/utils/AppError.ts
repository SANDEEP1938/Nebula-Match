import type { ValidationErrorItem } from '../types/index.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationErrorItem[];

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
