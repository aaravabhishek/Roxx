import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { OWNER_LINKS } from './ownerLinks.js';

export default function OwnerStores() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/owner/stores')
      .then((res) => setStores(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout links={OWNER_LINKS}>
      <div className="content-header">
        <h1>My Store(s)</h1>
        <p>Full details for every store registered under your account.</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : stores.length === 0 ? (
        <EmptyState title="No store assigned to your account yet." />
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {stores.map((store) => (
            <div key={store.id} className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>{store.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                {store.email}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.9rem' }}>
                {store.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RatingStars value={store.averageRating} readonly size="1rem" />
                <span className="field-hint">
                  {store.averageRating} ({store.totalRatings} rating{store.totalRatings === 1 ? '' : 's'})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
