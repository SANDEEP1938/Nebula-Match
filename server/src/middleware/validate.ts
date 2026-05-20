import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array().map((e) => ({
      field: e.type === 'field' ? e.path : 'unknown',
      message: e.msg as string,
    }));
    const error = new AppError('Validation failed', 400);
    error.errors = mapped;
    next(error);
    return;
  }
  next();
};
