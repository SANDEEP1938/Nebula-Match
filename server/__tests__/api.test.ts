import request from 'supertest';
import { createApp } from '../src/app.js';
import type { SanitizedUser } from '../src/types/index.js';

const app = createApp();

interface RegisterResult {
  username: string;
  email: string;
  password: string;
  token: string;
  user: SanitizedUser;
}

const registerUser = async (suffix: string): Promise<RegisterResult> => {
  const payload = {
    username: `player${suffix}`,
    email: `player${suffix}@test.com`,
    password: 'secret123',
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { ...payload, token: res.body.data.token, user: res.body.data.user };
};

describe('Nebula Match API', () => {
  test('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('registers and logs in a user', async () => {
    const user = await registerUser('a');
    expect(user.token).toBeTruthy();
    expect(user.user.username).toBe('playera');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();
  });

  test('returns game config', async () => {
    const res = await request(app).get('/api/game/config');
    expect(res.status).toBe(200);
    expect(res.body.data.difficulties).toHaveLength(3);
  });

  test('submits completed game and updates leaderboard', async () => {
    const user = await registerUser('b');
    const submit = await request(app)
      .post('/api/game/submit')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        difficulty: 'easy',
        moves: 18,
        timeSeconds: 45,
        pairsFound: 6,
        completed: true,
      });
    expect(submit.status).toBe(201);
    expect(submit.body.data.session.score).toBeGreaterThan(0);
    expect(submit.body.data.user.gamesWon).toBe(1);

    const board = await request(app).get('/api/leaderboard?difficulty=easy');
    expect(board.status).toBe(200);
    expect(board.body.data.entries.length).toBeGreaterThan(0);
    expect(board.body.data.entries[0].username).toBe('playerb');
  });

  test('rejects unauthenticated game submit', async () => {
    const res = await request(app).post('/api/game/submit').send({
      difficulty: 'easy',
      moves: 10,
      timeSeconds: 30,
      pairsFound: 6,
      completed: true,
    });
    expect(res.status).toBe(401);
  });

  test('returns profile for authenticated user', async () => {
    const user = await registerUser('c');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });

  test('resets password via forgot-password flow', async () => {
    const user = await registerUser('reset');
    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: user.email });
    expect(forgot.status).toBe(200);
    expect(forgot.body.data.resetUrl).toBeTruthy();

    const token = new URL(forgot.body.data.resetUrl as string).searchParams.get('token');
    expect(token).toBeTruthy();

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'newsecret456' });
    expect(reset.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'newsecret456' });
    expect(newLogin.status).toBe(200);
  });

  test('changes password when authenticated', async () => {
    const user = await registerUser('changepw');
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ currentPassword: user.password, newPassword: 'changed789' });
    expect(res.status).toBe(200);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'changed789' });
    expect(login.status).toBe(200);
  });
});
