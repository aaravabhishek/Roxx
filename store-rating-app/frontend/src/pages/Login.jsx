import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  user: '/user/dashboard',
  owner: '/owner/dashboard',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(ROLE_ROUTES[res.data.user.role] || '/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-brand">
          Store<span>wise</span>
        </div>
        <p className="auth-visual-quote">
          Honest ratings from real customers, helping every store grow with confidence.
        </p>
        <p className="auth-visual-foot">Trusted by shoppers, owners and administrators alike.</p>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Log in to continue to your dashboard.</p>
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
            />
            <Button type="submit" disabled={submitting} block>
              {submitting ? 'Logging in…' : 'Log In'}
            </Button>
          </form>
          <p className="auth-switch">
            New here? <Link to="/register">Create a normal user account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
