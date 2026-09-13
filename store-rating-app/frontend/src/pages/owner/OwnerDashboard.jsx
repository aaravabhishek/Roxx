import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { OWNER_LINKS } from './ownerLinks.js';

export default function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/owner/dashboard')
      .then((res) => setStores(res.data.stores))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout links={OWNER_LINKS}>
      <div className="content-header">
        <h1>Owner Dashboard</h1>
        <p>A snapshot of how your store(s) are performing.</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : stores.length === 0 ? (
        <EmptyState
          title="No store assigned to your account yet."
          subtitle="Please contact an administrator to have a store linked to your account."
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {stores.map((store) => (
            <div key={store.id} className="stat-card">
              <div className="stat-label">{store.name}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0.8rem' }}>
                {store.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RatingStars value={store.averageRating} readonly size="1.1rem" />
                <span className="stat-value" style={{ fontSize: '1.4rem' }}>
                  {store.averageRating}
                </span>
              </div>
              <div className="field-hint">
                {store.totalRatings} rating{store.totalRatings === 1 ? '' : 's'} submitted
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
