import type { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService.js';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../types/index.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body as RegisterInput);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body as LoginInput);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const user = await authService.getProfile(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.requestPasswordReset(req.body as ForgotPasswordInput);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.resetPassword(req.body as ResetPasswordInput);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const result = await authService.changePassword(
      req.user._id,
      req.body as ChangePasswordInput
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
