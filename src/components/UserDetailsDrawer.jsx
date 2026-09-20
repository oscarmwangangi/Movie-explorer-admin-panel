import { X } from 'lucide-react';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { daysUntil, formatDate, formatDateTime } from '../utils';

export default function UserDetailsDrawer({
  user,
  onClose,
  onExtend,
  onEnd,
  onReactivate,
  onResetPassword,
  onDisable,
  onEnable,
  onDelete,
}) {
  if (!user) return null;
  const remaining = daysUntil(user.expires_at);
  const isExpiredOrCancelled = user.status === 'expired' || user.status === 'cancelled';

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-header">
          <div className="drawer-header-info">
            <Avatar name={user.name || user.email} size={40} />
            <div>
              <h3>{user.name || user.email.split('@')[0]}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <h4>Profile</h4>
            <div className="fact-list">
              <div className="fact-row">
                <span>User ID</span>
                <span>{user.id}</span>
              </div>
              <div className="fact-row">
                <span>Created</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="fact-row">
                <span>Last login</span>
                <span>{formatDateTime(user.last_login_at)}</span>
              </div>
              <div className="fact-row">
                <span>Account</span>
                <span style={{ color: user.is_disabled ? 'var(--danger)' : 'var(--success)' }}>
                  {user.is_disabled ? 'Disabled' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <h4>Subscription</h4>
            <div className="fact-list">
              <div className="fact-row">
                <span>Plan</span>
                <span>{user.plan_type || '—'}</span>
              </div>
              <div className="fact-row">
                <span>Status</span>
                <StatusBadge status={user.status || 'none'} />
              </div>
              <div className="fact-row">
                <span>Expiration</span>
                <span>{formatDate(user.expires_at)}</span>
              </div>
              {remaining !== null && (
                <div className="fact-row">
                  <span>Remaining</span>
                  <span>{remaining >= 0 ? `${remaining} days` : `Expired ${Math.abs(remaining)}d ago`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="drawer-section">
            <h4>Account actions</h4>
            <div className="action-list">
              <button className="btn btn-ghost" onClick={() => onExtend(user)}>
                Extend subscription
              </button>
              {!isExpiredOrCancelled && (
                <button className="btn btn-ghost" onClick={() => onEnd(user)}>
                  End subscription
                </button>
              )}
              {isExpiredOrCancelled && (
                <button className="btn btn-ghost" onClick={() => onReactivate(user)}>
                  Reactivate subscription
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => onResetPassword(user)}>
                Reset password
              </button>
              {user.is_disabled ? (
                <button className="btn btn-ghost" onClick={() => onEnable(user)}>
                  Enable account
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => onDisable(user)}>
                  Disable account
                </button>
              )}
              <button className="btn btn-danger" onClick={() => onDelete(user)}>
                Delete account
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
