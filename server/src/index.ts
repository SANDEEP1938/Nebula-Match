import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async (): Promise<void> => {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
