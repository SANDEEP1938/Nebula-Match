import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, setError, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    setError(null);
    try {
      await login(form);
      const redirect =
        (location.state as { from?: string } | null)?.from || '/play';
      navigate(redirect);
    } catch (err) {
      let message = 'Login failed';
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          message =
            'Cannot reach the server. Start MongoDB, then run "npm run dev" from the project root.';
        } else {
          message =
            (err.response.data as { message?: string })?.message || 'Login failed';
        }
      }
      setLocalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <form className="auth-page panel" onSubmit={handleSubmit}>
        <h1 className="title-display" style={{ marginTop: 0 }}>
          Welcome back
        </h1>
        {(localError || error) && (
          <div className="alert alert-error">{localError || error}</div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p style={{ marginTop: '0.5rem', color: 'var(--muted)', textAlign: 'center' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
