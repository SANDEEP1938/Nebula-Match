import axios from 'axios';
import { useEffect, useState } from 'react';
import api from '../api/client';
import GameBoard from '../components/GameBoard';
import ProtectedRoute from '../components/ProtectedRoute';
import WinModal from '../components/WinModal';
import { useAuth } from '../context/AuthContext';
import { useMemoryGame } from '../hooks/useMemoryGame';
import type { ApiSuccess, Difficulty, User } from '../types';
import { DIFFICULTY_GRID } from '../utils/gameLogic';
import '../styles/game.css';

const PlayContent = () => {
  const { updateUser } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { state, handleCardClick, reset } = useMemoryGame(difficulty);
  const [submitting, setSubmitting] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state.completed || saved) {
      return;
    }
    setShowWin(true);
    const save = async () => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const { data } = await api.post<
          ApiSuccess<{
            session: { score: number };
            user: Pick<User, 'gamesPlayed' | 'gamesWon' | 'totalScore' | 'bestScore'>;
          }>
        >('/game/submit', {
          difficulty: state.difficulty,
          moves: state.moves,
          timeSeconds: state.elapsedSeconds,
          pairsFound: state.pairsFound,
          completed: true,
        });
        setLastScore(data.data.session.score);
        updateUser(data.data.user);
        setSaved(true);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message || 'Failed to save score'
          : 'Failed to save score';
        setSubmitError(message);
      } finally {
        setSubmitting(false);
      }
    };
    void save();
  }, [
    state.completed,
    state.difficulty,
    state.moves,
    state.elapsedSeconds,
    state.pairsFound,
    saved,
    updateUser,
  ]);

  const handleDifficultyChange = (level: Difficulty) => {
    setDifficulty(level);
    setShowWin(false);
    setSubmitError(null);
    setSaved(false);
  };

  const handlePlayAgain = () => {
    setShowWin(false);
    setSubmitError(null);
    setSaved(false);
    reset();
  };

  const cols = DIFFICULTY_GRID[difficulty].cols;
  const difficulties = Object.keys(DIFFICULTY_GRID) as Difficulty[];

  return (
    <div className="container page play-layout">
      <h1 className="title-display">Mission Deck</h1>
      {submitError && <div className="alert alert-error">{submitError}</div>}
      <div className="play-toolbar panel">
        <div className="difficulty-picker">
          {difficulties.map((level) => (
            <button
              key={level}
              type="button"
              className={difficulty === level ? 'active' : ''}
              onClick={() => handleDifficultyChange(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid-stats">
          <div className="stat-card">
            <span>Moves</span>
            <strong>{state.moves}</strong>
          </div>
          <div className="stat-card">
            <span>Time</span>
            <strong>{state.elapsedSeconds}s</strong>
          </div>
          <div className="stat-card">
            <span>Pairs</span>
            <strong>
              {state.pairsFound}/{state.totalPairs}
            </strong>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handlePlayAgain}>
          Reset
        </button>
      </div>
      <GameBoard
        cards={state.cards}
        cols={cols}
        onCardClick={handleCardClick}
        lockBoard={state.lockBoard}
      />
      {showWin && (
        <WinModal
          score={lastScore}
          moves={state.moves}
          timeSeconds={state.elapsedSeconds}
          onPlayAgain={handlePlayAgain}
          submitting={submitting}
        />
      )}
    </div>
  );
};

const Play = () => (
  <ProtectedRoute>
    <PlayContent />
  </ProtectedRoute>
);

export default Play;
