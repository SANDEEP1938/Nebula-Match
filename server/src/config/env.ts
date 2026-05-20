import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'MONGODB_URI'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 60,
};
