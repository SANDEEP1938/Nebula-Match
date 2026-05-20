import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { ApiSuccess } from '../types';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setResetUrl(null);

    try {
      const { data } = await api.post<
        ApiSuccess<{ message: string; resetUrl?: string }>
      >('/auth/forgot-password', { email });
      setMessage(data.data.message);
      if (data.data.resetUrl) {
        setResetUrl(data.data.resetUrl);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError(
            'Cannot reach the server. Start MongoDB, then run "npm run dev" from the project root.'
          );
        } else {
          const body = err.response.data as { message?: string };
          setError(body?.message || 'Request failed');
        }
      } else {
        setError('Request failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <form className="auth-page panel" onSubmit={handleSubmit}>
        <h1 className="title-display" style={{ marginTop: 0 }}>
          Reset password
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          Enter your email and we will send you a link to choose a new password.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {resetUrl && (
          <div className="panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Development mode — use this link:
            </p>
            <a href={resetUrl} style={{ wordBreak: 'break-all', color: 'var(--cyan)' }}>
              {resetUrl}
            </a>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
};

