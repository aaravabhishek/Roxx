import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { ErrorMessage, SuccessMessage } from '../../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../services/validators.js';
import { ADMIN_LINKS } from './adminLinks.js';

export default function AdminAddUser() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
      await api.post('/admin/users', form);
      setSuccess('User created successfully.');
      setForm({ name: '', email: '', address: '', password: '', role: 'user' });
      setTimeout(() => navigate('/admin/users'), 900);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="content-header">
        <h1>Add User</h1>
        <p>Create a Normal User, Store Owner, or Administrator account.</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <ErrorMessage message={serverError} />
        <SuccessMessage message={success} />
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            hint="20-60 characters."
          />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} />
          <Input
            label="Address"
            as="textarea"
            rows={3}
            name="address"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
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
          <Input label="Role" as="select" name="role" value={form.role} onChange={handleChange}>
            <option value="user">Normal User</option>
            <option value="owner">Store Owner</option>
            <option value="admin">Administrator</option>
          </Input>
          <Button type="submit" disabled={submitting} block>
            {submitting ? 'Creating…' : 'Create User'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
