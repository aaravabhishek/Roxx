import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { ADMIN_LINKS } from './adminLinks.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="content-header">
        <h1>Admin Dashboard</h1>
        <p>An overview of everything happening across Storewise.</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        stats && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Stores</div>
              <div className="stat-value">{stats.totalStores}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Ratings Submitted</div>
              <div className="stat-value">{stats.totalRatings}</div>
            </div>
          </div>
        )
      )}
    </DashboardLayout>
  );
}
