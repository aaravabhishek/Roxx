import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage.jsx';
import Input from '../../components/Input.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { OWNER_LINKS } from './ownerLinks.js';

export default function OwnerRatings() {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/owner/stores')
      .then((res) => {
        setStores(res.data);
        if (res.data.length > 0) setSelectedStoreId(String(res.data[0].id));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingStores(false));
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    setLoadingRatings(true);
    api
      .get(`/owner/stores/${selectedStoreId}/ratings`)
      .then((res) => {
        setRatings(res.data.ratings);
        setAverageRating(res.data.averageRating);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingRatings(false));
  }, [selectedStoreId]);

  return (
    <DashboardLayout links={OWNER_LINKS}>
      <div className="content-header">
        <h1>Ratings</h1>
        <p>See who rated your store, and the score they gave.</p>
      </div>

      <ErrorMessage message={error} />

      {loadingStores ? (
        <Loading />
      ) : stores.length === 0 ? (
        <EmptyState title="No store assigned to your account yet." />
      ) : (
        <>
          {stores.length > 1 && (
            <div className="toolbar">
              <Input
                as="select"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Input>
            </div>
          )}

          <div className="stat-grid" style={{ maxWidth: 320 }}>
            <div className="stat-card">
              <div className="stat-label">Average Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                <RatingStars value={averageRating} readonly size="1.1rem" />
                <span className="stat-value" style={{ fontSize: '1.4rem' }}>
                  {averageRating}
                </span>
              </div>
            </div>
          </div>

          {loadingRatings ? (
            <Loading />
          ) : ratings.length === 0 ? (
            <EmptyState title="No ratings submitted yet." subtitle="Once customers rate your store, they'll show up here." />
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r) => (
                      <tr key={r.userId}>
                        <td>{r.userName}</td>
                        <td>{r.userEmail}</td>
                        <td>
                          <RatingStars value={r.rating} readonly size="0.9rem" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
