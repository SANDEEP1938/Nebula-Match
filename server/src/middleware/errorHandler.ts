import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

interface ErrorWithMeta extends AppError {
  errors?: { field: string; message: string }[];
}

interface MongoDuplicateKeyError {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (
  err: ErrorWithMeta,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = err.statusCode || 500;
  let message =
    err.isOperational || process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  const mongoErr = err as MongoDuplicateKeyError;
  if (mongoErr.code === 11000) {
    statusCode = 409;
    if (mongoErr.keyPattern?.email) {
      message = 'Email already registered';
    } else if (mongoErr.keyPattern?.username) {
      message = 'Username already taken';
    } else {
      message = 'Account already exists';
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
  });
};
