import { useEffect, useState } from 'react';
import api from '../api/client';
import type { ApiSuccess, Difficulty, LeaderboardEntry, RecentWin } from '../types';
import '../styles/game.css';

const Leaderboard = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [recent, setRecent] = useState<RecentWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = difficulty ? `?difficulty=${difficulty}` : '';
        const [boardRes, recentRes] = await Promise.all([
          api.get<ApiSuccess<{ entries: LeaderboardEntry[] }>>(`/leaderboard${params}`),
          api.get<ApiSuccess<{ wins: RecentWin[] }>>('/leaderboard/recent'),
        ]);
        setEntries(boardRes.data.data.entries);
        setRecent(recentRes.data.data.wins);
      } catch {
        setError('Could not load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [difficulty]);

  return (
    <div className="container page">
      <h1 className="title-display">Global Leaderboard</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Loading rankings...</p>
      ) : (
        <>
          <div className="panel" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Pilot</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Moves</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No scores yet. Be the first to complete a mission.</td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={`${entry.userId}-${entry.difficulty}`}>
                      <td className="rank-badge">#{entry.rank}</td>
                      <td>{entry.username}</td>
                      <td>{entry.difficulty}</td>
                      <td>{entry.bestScore}</td>
                      <td>{entry.bestTime}s</td>
                      <td>{entry.bestMoves}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <h2>Recent victories</h2>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Pilot</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Moves</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((win) => (
                  <tr key={win.id}>
                    <td>{win.username}</td>
                    <td>{win.difficulty}</td>
                    <td>{win.score}</td>
                    <td>{win.moves}</td>
                    <td>{win.timeSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
