import { useEffect, useState } from 'react';
import api from '../api/client';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import type { ApiSuccess, DifficultyStats, GameSessionSummary } from '../types';
import '../styles/game.css';

const ProfileContent = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameSessionSummary[]>([]);
  const [stats, setStats] = useState<{ byDifficulty: DifficultyStats[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [historyRes, statsRes] = await Promise.all([
          api.get<ApiSuccess<{ sessions: GameSessionSummary[] }>>('/game/history'),
          api.get<ApiSuccess<{ byDifficulty: DifficultyStats[] }>>('/game/stats'),
        ]);
        setHistory(historyRes.data.data.sessions);
        setStats(statsRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="container page">
      <h1 className="title-display">Pilot Profile</h1>
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <div className="stat-card panel">
          <span>Username</span>
          <strong>{user.username}</strong>
        </div>
        <div className="stat-card panel">
          <span>Games played</span>
          <strong>{user.gamesPlayed}</strong>
        </div>
        <div className="stat-card panel">
          <span>Games won</span>
          <strong>{user.gamesWon}</strong>
        </div>
        <div className="stat-card panel">
          <span>Best score</span>
          <strong>{user.bestScore}</strong>
        </div>
        <div className="stat-card panel">
          <span>Total score</span>
          <strong>{user.totalScore}</strong>
        </div>
      </div>
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <>
          {stats && stats.byDifficulty.length > 0 && (
            <>
              <h2>Performance by difficulty</h2>
              <div className="panel" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Difficulty</th>
                      <th>Games</th>
                      <th>Wins</th>
                      <th>Avg score</th>
                      <th>Best</th>
                      <th>Avg moves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byDifficulty.map((row) => (
                      <tr key={row.difficulty}>
                        <td>{row.difficulty}</td>
                        <td>{row.games}</td>
                        <td>{row.wins}</td>
                        <td>{row.avgScore}</td>
                        <td>{row.bestScore}</td>
                        <td>{row.avgMoves}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <h2>Recent missions</h2>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Moves</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No games played yet.</td>
                  </tr>
                ) : (
                  history.map((session) => (
                    <tr key={session.id}>
                      <td>{session.difficulty}</td>
                      <td>{session.score}</td>
                      <td>{session.moves}</td>
                      <td>{session.timeSeconds}s</td>
                      <td>{session.completed ? 'Completed' : 'Abandoned'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ChangePasswordForm />
    </div>
  );
};

const Profile = () => (
  <ProtectedRoute>
    <ProfileContent />
  </ProtectedRoute>
);

export default Profile;
