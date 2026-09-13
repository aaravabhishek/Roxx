import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState, SuccessMessage } from '../../components/ErrorMessage.jsx';
import Input from '../../components/Input.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { USER_LINKS } from './userLinks.js';

export default function UserStores({ onlyRated = false }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchStores = useCallback(() => {
    setLoading(true);
    api
      .get('/stores', { params: { search } })
      .then((res) => setStores(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchStores, 300);
    return () => clearTimeout(timeout);
  }, [fetchStores]);

  async function handleRate(storeId, rating) {
    setError('');
    setSuccess('');
    setSavingId(storeId);
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? {
                ...s,
                userRating: rating,
              }
            : s
        )
      );
      setSuccess('Your rating has been saved.');
      fetchStores();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const visibleStores = onlyRated ? stores.filter((s) => s.userRating) : stores;

  return (
    <DashboardLayout links={USER_LINKS}>
      <div className="content-header">
        <h1>{onlyRated ? 'My Ratings' : 'Stores'}</h1>
        <p>
          {onlyRated
            ? 'Every store you have rated so far. You can update your rating any time.'
            : 'Browse all stores and share how they treated you.'}
        </p>
      </div>

      {!onlyRated && (
        <div className="toolbar">
          <Input
            placeholder="Search by store name or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <Loading />
      ) : visibleStores.length === 0 ? (
        <EmptyState
          title={onlyRated ? 'You have not rated any stores yet.' : 'No stores found.'}
          subtitle={onlyRated ? 'Head over to Stores to submit your first rating.' : 'Try a different search term.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {visibleStores.map((store) => (
            <div key={store.id} className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{store.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.9rem' }}>
                {store.address}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <RatingStars value={store.averageRating} readonly size="1rem" />
                <span className="field-hint">
                  {store.averageRating} overall ({store.totalRatings})
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <div className="field-hint" style={{ marginBottom: '0.35rem' }}>
                  {store.userRating ? 'Your rating — tap to change' : 'Tap to rate this store'}
                </div>
                <RatingStars
                  value={store.userRating || 0}
                  onChange={(val) => handleRate(store.id, val)}
                  size="1.4rem"
                />
                {savingId === store.id && <span className="field-hint"> Saving…</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
