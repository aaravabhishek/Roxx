import React from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import ChangePasswordForm from '../../components/ChangePasswordForm.jsx';
import { OWNER_LINKS } from './ownerLinks.js';

export default function OwnerChangePassword() {
  return (
    <DashboardLayout links={OWNER_LINKS}>
      <div className="content-header">
        <h1>Change Password</h1>
        <p>Update the password you use to log in.</p>
      </div>
      <ChangePasswordForm />
    </DashboardLayout>
  );
}
