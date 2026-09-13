import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { validateName, validateEmail, validateAddress, validatePassword } from '../services/validators.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const addressErr = validateAddress(form.address);
    const passwordErr = validatePassword(form.password);
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;
    if (passwordErr) newErrors.password = passwordErr;
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        address: form.address,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      navigate('/user/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err));
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
        <p className="auth-visual-quote">Join thousands of shoppers rating the stores they love.</p>
        <p className="auth-visual-foot">Your voice helps stores improve, one rating at a time.</p>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1>Create your account</h1>
          <p className="auth-subtitle">Register as a customer to start rating stores.</p>
          <ErrorMessage message={serverError} />
          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              hint="20–60 characters."
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Address"
              as="textarea"
              rows={3}
              name="address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              hint="Up to 400 characters."
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="8-16 characters, one uppercase letter, one special character."
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <Button type="submit" disabled={submitting} block>
              {submitting ? 'Creating account…' : 'Register'}
            </Button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
