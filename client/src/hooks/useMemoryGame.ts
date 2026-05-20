import { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty, GameState } from '../types/index';
import { createInitialState, flipCard, resolveMatches } from '../utils/gameLogic';

export const useMemoryGame = (difficulty: Difficulty) => {
  const [state, setState] = useState<GameState>(() => createInitialState(difficulty));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(createInitialState(difficulty));
  }, [difficulty]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (state.startedAt && !state.completed && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - (prev.startedAt ?? Date.now())) / 1000),
        }));
      }, 1000);
    }
    if (state.completed && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.startedAt, state.completed]);

  const handleCardClick = useCallback((index: number) => {
    setState((prev) => {
      let next = prev;
      if (!prev.startedAt) {
        next = { ...prev, startedAt: Date.now() };
      }
      next = flipCard(next, index);
      const flippedCount = next.cards.filter((c) => c.flipped && !c.matched).length;
      if (flippedCount === 2) {
        next = { ...next, lockBoard: true };
        setTimeout(() => {
          setState((current) => resolveMatches(current));
        }, 700);
      }
      return next;
    });
  }, []);

  return { state, handleCardClick, reset };
};
