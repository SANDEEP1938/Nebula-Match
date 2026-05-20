import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';

let mongoServer: MongoMemoryServer | undefined;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  env.mongoUri = mongoServer.getUri();
  await mongoose.connect(env.mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
