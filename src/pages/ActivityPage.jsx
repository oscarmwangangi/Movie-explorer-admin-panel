import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../api';
import { formatDateTime } from '../utils';

const PAGE_SIZE = 20;

// Turns the action code from the server into words for a person.
const ACTION_LABELS = {
  user_created: 'Created user',
  user_updated: 'Edited user',
  subscription_extended: 'Extended subscription',
  subscription_ended: 'Ended subscription',
  subscription_reactivated: 'Reactivated subscription',
  password_reset: 'Reset password',
  account_disabled: 'Disabled account',
  account_enabled: 'Enabled account',
  account_deleted: 'Deleted account',
  settings_changed: 'Changed settings',
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ activity: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError('');
    api
      .getActivity({ page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [page, reload]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Activity</h1>
          <p>What admins changed, newest first.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReload((n) => n + 1)}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

      {!error && data.activity.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            {isLoading ? 'Loading activity...' : 'Nothing has happened yet. Admin actions will show up here.'}
          </div>
        </div>
      ) : (
        <div className="table-scroll" style={{ opacity: isLoading ? 0.6 : 1 }}>
          <table className="stack-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.activity.map((row) => (
                <tr key={row.id}>
                  <td data-label="When">{formatDateTime(row.created_at)}</td>
                  <td data-label="Admin">{row.admin_email || '—'}</td>
                  <td data-label="Action">{ACTION_LABELS[row.action] || row.action}</td>
                  <td data-label="Details">{row.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.total > PAGE_SIZE && (
        <div className="pager">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="pager-buttons">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
