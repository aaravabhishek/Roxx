import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminStores from './pages/admin/AdminStores.jsx';
import AdminAddUser from './pages/admin/AdminAddUser.jsx';
import AdminAddStore from './pages/admin/AdminAddStore.jsx';
import AdminChangePassword from './pages/admin/AdminChangePassword.jsx';

import UserDashboard from './pages/user/UserDashboard.jsx';
import UserStores from './pages/user/UserStores.jsx';
import UserChangePassword from './pages/user/UserChangePassword.jsx';

import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import OwnerStores from './pages/owner/OwnerStores.jsx';
import OwnerRatings from './pages/owner/OwnerRatings.jsx';
import OwnerChangePassword from './pages/owner/OwnerChangePassword.jsx';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  user: '/user/dashboard',
  owner: '/owner/dashboard',
};

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/new"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAddStore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/change-password"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Normal user routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/stores"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/my-ratings"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserStores onlyRated />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/change-password"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Store owner routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/my-stores"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/ratings"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerRatings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/change-password"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerChangePassword />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
