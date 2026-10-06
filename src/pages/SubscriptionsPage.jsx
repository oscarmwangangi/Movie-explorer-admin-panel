import { useMemo } from 'react';
import UsersTable from '../components/UsersTable';

export default function SubscriptionsPage({ users, onRowClick, onExtend, onEnd, busyUserId }) {
  const subscribed = useMemo(() => {
    return users
      .filter((u) => u.status && u.status !== 'none')
      .sort((a, b) => new Date(a.expires_at || 0) - new Date(b.expires_at || 0));
  }, [users]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Every subscribed user, ordered by soonest expiration.</p>
        </div>
      </div>

      <UsersTable
        users={subscribed}
        onRowClick={onRowClick}
        onExtend={onExtend}
        onEnd={onEnd}
        busyUserId={busyUserId}
      />
    </div>
  );
}
