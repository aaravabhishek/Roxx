import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_LINKS } from './userLinks.js';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/user/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout links={USER_LINKS}>
      <div className="content-header">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>{user?.email} · {user?.address}</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Stores You've Rated</div>
              <div className="stat-value">{stats.storesRated}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Stores Available</div>
              <div className="stat-value">{stats.totalStores}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>Discover stores worth rating</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.1rem' }}>
              Browse every store on Storewise, search by name or address, and share your rating.
            </p>
            <Link to="/user/stores" className="btn btn-accent">
              Browse Stores
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
