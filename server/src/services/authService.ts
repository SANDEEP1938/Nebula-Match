import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User, type IUserDocument } from '../models/User.js';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SanitizedUser,
} from '../types/index.js';
import { AppError } from '../utils/AppError.js';
import { generateResetToken, hashResetToken } from '../utils/token.js';

const RESET_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

const signToken = (userId: Types.ObjectId): string => {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ id: userId.toString() }, env.jwtSecret, options);
};

const sanitizeUser = (user: IUserDocument): SanitizedUser => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  gamesPlayed: user.gamesPlayed,
  gamesWon: user.gamesWon,
  totalScore: user.totalScore,
  bestScore: user.bestScore,
  createdAt: user.createdAt,
});

export const registerUser = async ({ username, email, password }: RegisterInput) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (existing) {
    if (existing.email === normalizedEmail) {
      throw new AppError('Email already registered', 409);
    }
    throw new AppError('Username already taken', 409);
  }

  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
  });
  const token = signToken(user._id);
  return { user: sanitizeUser(user), token };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = signToken(user._id);
  return { user: sanitizeUser(user), token };
};

export const getProfile = async (userId: Types.ObjectId): Promise<SanitizedUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
};

export const requestPasswordReset = async ({ email }: ForgotPasswordInput) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return { message: RESET_MESSAGE };
  }

  const rawToken = generateResetToken();
  const hashedToken = hashResetToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.passwordResetExpiresMinutes * 60 * 1000
  );

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;

  if (env.nodeEnv !== 'production') {
    console.log(`[password-reset] Reset link for ${normalizedEmail}: ${resetUrl}`);
    return { message: RESET_MESSAGE, resetUrl };
  }

  return { message: RESET_MESSAGE };
};

export const resetPassword = async ({ token, password }: ResetPasswordInput) => {
  const hashedToken = hashResetToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: 'Password updated successfully' };
};

export const changePassword = async (
  userId: Types.ObjectId,
  { currentPassword, newPassword }: ChangePasswordInput
) => {
  const user = await User.findById(userId).select(
    '+password +passwordResetToken +passwordResetExpires'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: 'Password changed successfully' };
};
