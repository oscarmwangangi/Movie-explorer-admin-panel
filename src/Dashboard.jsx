import { useEffect, useState } from 'react';
import { api } from './api';

// Turns a status string into a colored pill, so it's easy to scan.
function StatusBadge({ status }) {
  const colors = {
    active: '#1a7f37',
    pending: '#b08800',
    expired: '#a30000',
    cancelled: '#666666',
    none: '#999999',
  };
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colors[status] || '#999999' }}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Tracks which user row is currently doing an extend/end action,
  // so we can disable just that row's buttons (not the whole page).
  const [busyUserId, setBusyUserId] = useState(null);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Load the user list once when the dashboard first appears.
  useEffect(() => {
    loadUsers();
  }, []);

  async function handleExtend(userId) {
    const days = window.prompt('Extend by how many days?', '30');
    if (!days) return; // user clicked Cancel

    setBusyUserId(userId);
    try {
      await api.extendSubscription(userId, Number(days));
      await loadUsers(); // refresh the table to show the new status
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleEnd(userId) {
    const confirmed = window.confirm('End this user\'s subscription now?');
    if (!confirmed) return;

    setBusyUserId(userId);
    try {
      await api.endSubscription(userId);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyUserId(null);
    }
  }

  if (isLoading) return <p className="page-message">Loading users...</p>;
  if (error) return <p className="page-message error-text">{error}</p>;

  return (
    <div className="dashboard">
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Expires</th>
            <th>Last login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.plan_type || '-'}</td>
              <td><StatusBadge status={user.status} /></td>
              <td>{user.expires_at ? new Date(user.expires_at).toLocaleDateString() : '-'}</td>
              <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</td>
              <td className="actions-cell">
                <button
                  disabled={busyUserId === user.id}
                  onClick={() => handleExtend(user.id)}
                >
                  Extend
                </button>
                <button
                  disabled={busyUserId === user.id}
                  className="danger-button"
                  onClick={() => handleEnd(user.id)}
                >
                  End
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
