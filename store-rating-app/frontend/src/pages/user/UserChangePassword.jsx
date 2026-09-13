import React from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import ChangePasswordForm from '../../components/ChangePasswordForm.jsx';
import { USER_LINKS } from './userLinks.js';

export default function UserChangePassword() {
  return (
    <DashboardLayout links={USER_LINKS}>
      <div className="content-header">
        <h1>Change Password</h1>
        <p>Update the password you use to log in.</p>
      </div>
      <ChangePasswordForm />
    </DashboardLayout>
  );
}
