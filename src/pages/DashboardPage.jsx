import { useMemo } from 'react';
import { Users, UserCheck, UserX, Clock, UserPlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '../components/StatCard';
import UsersTable from '../components/UsersTable';
import SalesOverview from '../components/SalesOverview';

const STATUS_COLORS = {
  active: '#35c46a',
  pending: '#e3a13a',
  expired: '#e5555f',
  cancelled: '#8890a0',
  none: '#4b5160',
};

export default function DashboardPage({ users, onRowClick, onExtend, onEnd, busyUserId }) {
  const stats = useMemo(() => {
    const counts = { active: 0, pending: 0, expired: 0, cancelled: 0, none: 0 };
    let newLast7Days = 0;
    const now = Date.now();

    users.forEach((u) => {
      const status = u.status && counts[u.status] !== undefined ? u.status : 'none';
      counts[status] += 1;
      if (u.created_at) {
        const created = new Date(u.created_at).getTime();
        if (!Number.isNaN(created) && now - created <= 7 * 24 * 60 * 60 * 1000) {
          newLast7Days += 1;
        }
      }
    });

    return { counts, total: users.length, newLast7Days };
  }, [users]);

  const chartData = Object.entries(stats.counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ name: key, value }));

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [users]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>An overview of Movie Explorer's sales, users and subscriptions.</p>
        </div>
      </div>

      <SalesOverview />

      <div className="section-head">
        <div>
          <h2>Users</h2>
          <p>Who is signed up and who is subscribed.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total users" value={stats.total} icon={Users} tone="accent" />
        <StatCard label="Active subscribers" value={stats.counts.active} icon={UserCheck} tone="success" />
        <StatCard label="Expired subscribers" value={stats.counts.expired} icon={UserX} tone="danger" />
        <StatCard label="Pending" value={stats.counts.pending} icon={Clock} tone="warning" />
        <StatCard label="New users (7 days)" value={stats.newLast7Days} icon={UserPlus} tone="info" />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Recent users</h3>
          </div>
          <UsersTable
            users={recentUsers}
            onRowClick={onRowClick}
            onExtend={onExtend}
            onEnd={onEnd}
            busyUserId={busyUserId}
            compact
          />
          <div style={{ height: 8 }} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Subscription breakdown</h3>
            <span className="panel-subtext">Current snapshot</span>
          </div>
          {chartData.length === 0 ? (
            <div className="empty-state">No users yet.</div>
          ) : (
            <>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e2229',
                        border: '1px solid #262b33',
                        borderRadius: 8,
                        fontSize: 12.5,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                {chartData.map((entry) => (
                  <div className="legend-row" key={entry.name}>
                    <span>
                      <span className="legend-dot" style={{ background: STATUS_COLORS[entry.name] }} />
                      {entry.name[0].toUpperCase() + entry.name.slice(1)}
                    </span>
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
