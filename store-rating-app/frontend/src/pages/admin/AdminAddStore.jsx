import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { ErrorMessage, SuccessMessage } from '../../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { validateEmail, validateAddress } from '../../services/validators.js';
import { ADMIN_LINKS } from './adminLinks.js';

export default function AdminAddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/admin/owners')
      .then((res) => setOwners(res.data))
      .catch(() => setOwners([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length > 60) {
      newErrors.name = 'Store name is required and must not exceed 60 characters.';
    }
    const emailErr = validateEmail(form.email);
    if (emailErr) newErrors.email = emailErr;
    const addressErr = validateAddress(form.address);
    if (addressErr) newErrors.address = addressErr;
    if (!form.ownerId) newErrors.ownerId = 'Please select a store owner.';
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
      await api.post('/admin/stores', form);
      setSuccess('Store created successfully.');
      setForm({ name: '', email: '', address: '', ownerId: '' });
      setTimeout(() => navigate('/admin/stores'), 900);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="content-header">
        <h1>Add Store</h1>
        <p>Register a new store and assign it to an existing store owner.</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <ErrorMessage message={serverError} />
        <SuccessMessage message={success} />

        {owners.length === 0 ? (
          <p className="field-hint">
            No Store Owner accounts exist yet. Please create one from the{' '}
            <strong>Add User</strong> page (role: Store Owner) before adding a store.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input label="Store Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
            <Input
              label="Store Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Store Address"
              as="textarea"
              rows={3}
              name="address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
            <Input
              label="Store Owner"
              as="select"
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
              error={errors.ownerId}
            >
              <option value="">Select an owner…</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </Input>
            <Button type="submit" disabled={submitting} block>
              {submitting ? 'Creating…' : 'Create Store'}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
