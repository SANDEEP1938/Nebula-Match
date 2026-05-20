import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      navigate('/play');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError(
            'Cannot reach the server. Start MongoDB, then run "npm run dev" from the project root.'
          );
        } else {
          const data = err.response.data as {
            message?: string;
            errors?: { message: string }[];
          };
          if (data?.errors?.length) {
            setError(data.errors.map((f) => f.message).join(', '));
          } else {
            setError(data?.message || 'Registration failed');
          }
        }
      } else {
        setError('Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <form className="auth-page panel" onSubmit={handleSubmit}>
        <h1 className="title-display" style={{ marginTop: 0 }}>
          Join the fleet
        </h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            minLength={3}
            maxLength={24}
            required
          />
        </div>
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
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
