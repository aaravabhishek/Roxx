import React, { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import { ErrorMessage, SuccessMessage } from './ErrorMessage.jsx';
import { validatePassword } from '../services/validators.js';
import api, { getErrorMessage } from '../services/api.js';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!form.currentPassword) newErrors.currentPassword = 'Current password is required.';
    const passErr = validatePassword(form.newPassword);
    if (passErr) newErrors.newPassword = passErr;
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.put('/auth/change-password', form);
      setSuccess('Your password has been updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 440 }}>
      <ErrorMessage message={serverError} />
      <SuccessMessage message={success} />
      <form onSubmit={handleSubmit}>
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          hint="8-16 characters, at least one uppercase letter and one special character."
        />
        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button type="submit" disabled={submitting} block>
          {submitting ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
