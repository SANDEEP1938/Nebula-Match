import { calculateScore, getPairCount } from '../src/utils/score.js';

describe('score utilities', () => {
  test('returns pair counts per difficulty', () => {
    expect(getPairCount('easy')).toBe(6);
    expect(getPairCount('medium')).toBe(8);
    expect(getPairCount('hard')).toBe(10);
  });

  test('scores completed games with penalties', () => {
    const score = calculateScore({
      difficulty: 'easy',
      moves: 20,
      timeSeconds: 60,
      completed: true,
    });
    expect(score).toBe(400);
  });

  test('returns zero for incomplete games', () => {
    const score = calculateScore({
      difficulty: 'hard',
      moves: 5,
      timeSeconds: 10,
      completed: false,
    });
    expect(score).toBe(0);
  });

  test('enforces minimum score of 100', () => {
    const score = calculateScore({
      difficulty: 'easy',
      moves: 200,
      timeSeconds: 500,
      completed: true,
    });
    expect(score).toBe(100);
  });
});
