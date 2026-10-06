import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../api';
import { formatDateTime } from '../utils';

// Colour for each kind of alert (uses the badge colours from index.css).
const TYPE_STYLE = {
  expiring_soon: { label: 'Expiring', className: 'badge-pending' },
  expired: { label: 'Expired', className: 'badge-expired' },
  payment_failed: { label: 'Payment', className: 'badge-failed' },
  new_signup: { label: 'New user', className: 'badge-active' },
};

export default function NotificationsPage({ onOpenUser }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError('');
    api
      .getNotifications()
      .then((data) => {
        if (!ignore) setItems(data.notifications || []);
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
  }, [reload]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Expiring subscriptions, failed payments and new sign-ups from the last 7 days.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReload((n) => n + 1)}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

      {!error && items.length === 0 ? (
        <div className="panel">
          <div className="empty-state">{isLoading ? 'Loading...' : 'All clear. Nothing needs your attention.'}</div>
        </div>
      ) : (
        <div className="panel notice-list">
          {items.map((item, index) => {
            const style = TYPE_STYLE[item.type] || TYPE_STYLE.new_signup;
            return (
              <button
                key={`${item.type}-${item.userId}-${index}`}
                className="notice-row"
                onClick={() => onOpenUser(item.userId)}
              >
                <span className={`status-badge ${style.className}`}>{style.label}</span>
                <span className="notice-text">
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                </span>
                <span className="notice-time">{formatDateTime(item.createdAt)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
