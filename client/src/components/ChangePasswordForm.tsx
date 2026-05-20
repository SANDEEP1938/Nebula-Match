import axios from 'axios';
import { FormEvent, useState } from 'react';
import api from '../api/client';
import type { ApiSuccess } from '../types';

const ChangePasswordForm = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword !== form.confirm) {
      setError('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<ApiSuccess<{ message: string }>>(
        '/auth/change-password',
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }
      );
      setSuccess(data.data.message);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as { message?: string };
        setError(body?.message || 'Could not change password');
      } else {
        setError('Could not change password');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel auth-page" style={{ maxWidth: '100%', marginTop: '2rem' }} onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>Change password</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="form-group">
        <label htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          minLength={6}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmNew">Confirm new password</label>
        <input
          id="confirmNew"
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          minLength={6}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Updating...' : 'Update password'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
