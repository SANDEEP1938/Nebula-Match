import { describe, expect, test } from 'vitest';
import {
  canFlipCard,
  createDeck,
  createInitialState,
  flipCard,
  resolveMatches,
} from '../utils/gameLogic';

describe('gameLogic', () => {
  test('creates deck with correct pair count', () => {
    const deck = createDeck('medium', () => 0.5);
    expect(deck).toHaveLength(16);
    const symbols = new Set(deck.map((c) => c.pairId));
    expect(symbols.size).toBe(8);
  });

  test('flips and matches pairs', () => {
    let state = createInitialState('easy');
    const pairIndices: number[] = [];
    state.cards.forEach((card, index) => {
      if (card.pairId === 0) {
        pairIndices.push(index);
      }
    });
    state = flipCard(state, pairIndices[0]);
    state = flipCard(state, pairIndices[1]);
    state = resolveMatches(state);
    expect(state.pairsFound).toBe(1);
    expect(state.cards.filter((c) => c.matched)).toHaveLength(2);
  });

  test('prevents flipping more than two cards', () => {
    let state = createInitialState('easy');
    const open = state.cards.slice(0, 3).map((_, i) => i);
    state = flipCard(state, open[0]);
    state = flipCard(state, open[1]);
    expect(canFlipCard(state, open[2])).toBe(false);
  });
});
