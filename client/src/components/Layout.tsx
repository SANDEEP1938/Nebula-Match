import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const navClass = ({ isActive }: { isActive: boolean }): string | undefined =>
  isActive ? 'active' : undefined;

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-icon">✦</span>
            Nebula Match
          </NavLink>
          <nav className="nav-links">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/play" className={navClass}>
              Play
            </NavLink>
            <NavLink to="/leaderboard" className={navClass}>
              Leaderboard
            </NavLink>
            {isAuthenticated && user ? (
              <>
                <NavLink to="/profile" className={navClass}>
                  Profile
                </NavLink>
                <button type="button" className="btn btn-ghost" onClick={logout}>
                  Logout ({user.username})
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navClass}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">Nebula Match — MERN Memory Challenge</div>
      </footer>
    </div>
  );
};
