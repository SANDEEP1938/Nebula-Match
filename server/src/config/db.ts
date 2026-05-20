import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch {
    console.error('MongoDB connection failed.');
    console.error(`URI: ${env.mongoUri}`);
    console.error('Start MongoDB from the project root: docker compose up -d');
    console.error('Or install locally: brew services start mongodb-community');
    throw new Error('MongoDB connection failed');
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
