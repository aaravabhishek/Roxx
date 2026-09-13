import React from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import ChangePasswordForm from '../../components/ChangePasswordForm.jsx';
import { ADMIN_LINKS } from './adminLinks.js';

export default function AdminChangePassword() {
  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="content-header">
        <h1>Change Password</h1>
        <p>Update your administrator password.</p>
      </div>
      <ChangePasswordForm />
    </DashboardLayout>
  );
}
