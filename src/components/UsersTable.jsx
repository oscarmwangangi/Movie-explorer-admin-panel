import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateTime } from '../utils';

export default function UsersTable({ users, onRowClick, onExtend, onEnd, busyUserId, compact }) {
  if (users.length === 0) {
    return <div className="empty-state">No users match the current filters.</div>;
  }

  return (
    <div className="table-scroll">
      <table className="stack-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            {!compact && <th>Created</th>}
            <th>Last login</th>
            <th>Expiration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="clickable-row" onClick={() => onRowClick(user)}>
              <td data-label="User">
                <div className="user-cell">
                  <Avatar name={user.name || user.email} size={30} />
                  <div>
                    <div className="user-name">
                      {user.name || user.email.split('@')[0]}
                      {user.is_disabled && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--danger)',
                            background: 'var(--danger-wash)',
                            padding: '2px 6px',
                            borderRadius: 999,
                          }}
                        >
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              </td>
              <td data-label="Plan">{user.plan_type || '—'}</td>
              <td data-label="Status">
                <StatusBadge status={user.status || 'none'} />
              </td>
              {!compact && <td data-label="Created">{formatDate(user.created_at)}</td>}
              <td data-label="Last login">{formatDateTime(user.last_login_at)}</td>
              <td data-label="Expiration">{formatDate(user.expires_at)}</td>
              <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busyUserId === user.id}
                  onClick={() => onExtend(user)}
                >
                  Extend
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={busyUserId === user.id}
                  onClick={() => onEnd(user)}
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
