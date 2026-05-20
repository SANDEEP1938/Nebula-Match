import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import type { ApiSuccess } from '../types';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [form, setForm] = useState({ token: tokenFromUrl, password: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post<ApiSuccess<{ message: string }>>('/auth/reset-password', {
        token: form.token,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError(
            'Cannot reach the server. Start MongoDB, then run "npm run dev" from the project root.'
          );
        } else {
          const body = err.response.data as { message?: string };
          setError(body?.message || 'Reset failed');
        }
      } else {
        setError('Reset failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container page">
        <div className="auth-page panel">
          <h1 className="title-display" style={{ marginTop: 0 }}>
            Password updated
          </h1>
          <p className="alert alert-success">You can now sign in with your new password.</p>
          <Link to="/login" className="btn btn-primary">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <form className="auth-page panel" onSubmit={handleSubmit}>
        <h1 className="title-display" style={{ marginTop: 0 }}>
          Choose new password
        </h1>
        {error && <div className="alert alert-error">{error}</div>}
        {!tokenFromUrl && (
          <div className="form-group">
            <label htmlFor="token">Reset token</label>
            <input
              id="token"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting || !form.token}
        >
          {submitting ? 'Updating...' : 'Update password'}
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
