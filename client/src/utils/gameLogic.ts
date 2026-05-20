import type { Card, Difficulty, GameState } from '../types/index.js';

export const SYMBOLS = ['🌙', '⭐', '🪐', '🚀', '☄️', '🛸', '🌌', '🔭', '💫', '🌠', '🌍', '⚡'];

export const DIFFICULTY_GRID: Record<Difficulty, { pairs: number; cols: number }> = {
  easy: { pairs: 6, cols: 3 },
  medium: { pairs: 8, cols: 4 },
  hard: { pairs: 10, cols: 5 },
};

export const createDeck = (difficulty: Difficulty, random: () => number = Math.random): Card[] => {
  const { pairs } = DIFFICULTY_GRID[difficulty];
  const chosen = SYMBOLS.slice(0, pairs);
  const cards = chosen.flatMap((symbol, index) => [
    { id: `${index}-a`, symbol, pairId: index, index: 0, matched: false, flipped: false },
    { id: `${index}-b`, symbol, pairId: index, index: 0, matched: false, flipped: false },
  ]);

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards.map((card, index) => ({
    ...card,
    index,
    matched: false,
    flipped: false,
  }));
};

export const canFlipCard = (gameState: GameState, cardIndex: number): boolean => {
  const card = gameState.cards[cardIndex];
  if (!card || card.matched || card.flipped) {
    return false;
  }
  if (gameState.lockBoard) {
    return false;
  }
  const flippedCount = gameState.cards.filter((c) => c.flipped && !c.matched).length;
  return flippedCount < 2;
};

export const flipCard = (gameState: GameState, cardIndex: number): GameState => {
  if (!canFlipCard(gameState, cardIndex)) {
    return gameState;
  }
  const cards = gameState.cards.map((c, i) =>
    i === cardIndex ? { ...c, flipped: true } : c
  );
  const flippedUnmatched = cards.filter((c) => c.flipped && !c.matched);
  const moves = flippedUnmatched.length === 2 ? gameState.moves + 1 : gameState.moves;
  return { ...gameState, cards, moves };
};

export const resolveMatches = (gameState: GameState): GameState => {
  const flipped = gameState.cards
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => c.flipped && !c.matched);

  if (flipped.length !== 2) {
    return { ...gameState, lockBoard: false };
  }

  const [first, second] = flipped;
  if (first.pairId === second.pairId) {
    const cards = gameState.cards.map((c) =>
      c.pairId === first.pairId ? { ...c, matched: true, flipped: true } : c
    );
    const pairsFound = cards.filter((c) => c.matched).length / 2;
    const completed = pairsFound === gameState.totalPairs;
    return {
      ...gameState,
      cards,
      pairsFound,
      lockBoard: false,
      completed,
    };
  }

  const cards = gameState.cards.map((c) =>
    c.flipped && !c.matched ? { ...c, flipped: false } : c
  );
  return { ...gameState, cards, lockBoard: false };
};

export const createInitialState = (difficulty: Difficulty): GameState => {
  const { pairs } = DIFFICULTY_GRID[difficulty];
  return {
    difficulty,
    cards: createDeck(difficulty),
    moves: 0,
    pairsFound: 0,
    totalPairs: pairs,
    lockBoard: false,
    completed: false,
    startedAt: null,
    elapsedSeconds: 0,
  };
};
