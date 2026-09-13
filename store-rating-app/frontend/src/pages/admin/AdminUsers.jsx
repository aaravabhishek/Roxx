import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Table from '../../components/Table.jsx';
import Loading from '../../components/Loading.jsx';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage.jsx';
import Input from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { ADMIN_LINKS } from './adminLinks.js';

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState({ sortBy: 'created_at', order: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/users', { params: { search, role, sortBy: sort.sortBy, order: sort.order } })
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, role, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  function handleSort(key) {
    setSort((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }

  async function openDetails(id) {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data.user);
      setSelectedStores(res.data.stores || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <DashboardLayout links={ADMIN_LINKS}>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Browse, search and inspect every account on the platform.</p>
        </div>
        <Link to="/admin/users/new" className="btn btn-accent">
          + Add User
        </Link>
      </div>

      <div className="toolbar">
        <Input
          placeholder="Search by name, email or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input as="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal User</option>
          <option value="owner">Store Owner</option>
        </Input>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState title="No users found." subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table
            columns={COLUMNS}
            rows={users}
            sort={sort}
            onSort={handleSort}
            renderRow={(u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openDetails(u.id)}>
                    View
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      )}

      {(selectedUser || detailsLoading) && (
        <Modal title="User Details" onClose={() => setSelectedUser(null)}>
          {detailsLoading ? (
            <Loading />
          ) : (
            <>
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Address:</strong> {selectedUser.address}
              </p>
              <p>
                <strong>Role:</strong> <span className={`badge badge-${selectedUser.role}`}>{selectedUser.role}</span>
              </p>

              {selectedUser.role === 'owner' && (
                <div style={{ marginTop: '1.2rem' }}>
                  <h4 style={{ marginBottom: '0.6rem' }}>Store Ratings</h4>
                  {selectedStores.length === 0 ? (
                    <p className="field-hint">This owner has no stores yet.</p>
                  ) : (
                    selectedStores.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          padding: '0.75rem 0',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                      >
                        <strong>{s.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                          <RatingStars value={s.averageRating} readonly size="1rem" />
                          <span className="field-hint">
                            {s.averageRating} ({s.totalRatings} rating{s.totalRatings === 1 ? '' : 's'})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
