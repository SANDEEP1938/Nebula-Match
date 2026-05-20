import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/game.css';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container page">
      <section className="hero">
        <div>
          <h1 className="title-display">Match the cosmos. Claim your rank.</h1>
          <p>
            Nebula Match is a fast-paced memory card game. Flip cards, find matching
            cosmic symbols, beat the clock, and climb the global leaderboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/play" className="btn btn-primary">
              Start Playing
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-ghost">
                Create Account
              </Link>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          🌌
        </div>
      </section>
      <section className="feature-grid">
        <article className="feature-card panel">
          <h3>Three difficulties</h3>
          <p>Easy, medium, and hard grids with increasing pairs and score potential.</p>
        </article>
        <article className="feature-card panel">
          <h3>Live scoring</h3>
          <p>Fewer moves and faster clears earn higher scores on the server.</p>
        </article>
        <article className="feature-card panel">
          <h3>Global leaderboard</h3>
          <p>Compete with other pilots and track your personal stats and history.</p>
        </article>
      </section>
    </div>
  );
};

