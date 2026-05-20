import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      next(new AppError('User no longer exists', 401));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};
