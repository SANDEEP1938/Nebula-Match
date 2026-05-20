import cors from 'cors';
import express, { type Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createApp = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Nebula Match API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  if (env.nodeEnv === 'production') {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
