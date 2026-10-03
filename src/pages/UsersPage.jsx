import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import UsersTable from '../components/UsersTable';

export default function UsersPage({ users, search, onSearchChange, onRowClick, onExtend, onEnd, onAddUser, busyUserId }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const plans = useMemo(() => {
    const set = new Set(users.map((u) => u.plan_type).filter(Boolean));
    return Array.from(set);
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== 'all' && (u.status || 'none') !== statusFilter) return false;
      if (planFilter !== 'all' && u.plan_type !== planFilter) return false;
      if (accountFilter === 'disabled' && !u.is_disabled) return false;
      if (accountFilter === 'active' && u.is_disabled) return false;
      if (!term) return true;
      return (
        u.email?.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term) ||
        String(u.id).toLowerCase().includes(term)
      );
    });
  }, [users, search, statusFilter, planFilter, accountFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage Movie Explorer users and their subscriptions.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddUser}>
          <Plus size={16} />
          Add user
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="none">No subscription</option>
        </select>

        {plans.length > 0 && (
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="all">All plans</option>
            {plans.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
          <option value="all">All accounts</option>
          <option value="active">Not disabled</option>
          <option value="disabled">Disabled</option>
        </select>

        <div className="toolbar-spacer" />
        <span className="panel-subtext">
          {filtered.length} of {users.length} users
        </span>
      </div>

      <UsersTable
        users={filtered}
        onRowClick={onRowClick}
        onExtend={onExtend}
        onEnd={onEnd}
        busyUserId={busyUserId}
      />
    </div>
  );
}
