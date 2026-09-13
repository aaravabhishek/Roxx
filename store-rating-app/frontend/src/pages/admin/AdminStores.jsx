import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Table from '../../components/Table.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage.jsx';
import Input from '../../components/Input.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { ADMIN_LINKS } from './adminLinks.js';

const COLUMNS = [
  { key: 'name', label: 'Store Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'rating', label: 'Overall Rating', sortable: true },
  { key: 'owner_name', label: 'Owner', sortable: true },
];

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/stores', { params: { search, sortBy: sort.sortBy, order: sort.order } })
      .then((res) => setStores(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchStores, 300);
    return () => clearTimeout(timeout);
  }, [fetchStores]);

  function handleSort(key) {
    setSort((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="page-header">
        <div>
          <h1>Stores</h1>
          <p>Every store registered on Storewise, with its live overall rating.</p>
        </div>
        <Link to="/admin/stores/new" className="btn btn-accent">
          + Add Store
        </Link>
      </div>

      <div className="toolbar">
        <Input
          placeholder="Search by name, email or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : stores.length === 0 ? (
        <EmptyState title="No stores found." subtitle="Try adjusting your search, or add a new store." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table
            columns={COLUMNS}
            rows={stores}
            sort={sort}
            onSort={handleSort}
            renderRow={(s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RatingStars value={s.averageRating} readonly size="0.95rem" />
                    <span className="field-hint">
                      {s.averageRating} ({s.totalRatings})
                    </span>
                  </div>
                </td>
                <td>{s.ownerName || '—'}</td>
              </tr>
            )}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
