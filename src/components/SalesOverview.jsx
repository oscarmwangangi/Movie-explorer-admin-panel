// The "Sales" part of the dashboard: how much money came in through M-Pesa.
// It loads its own numbers from the backend, so the rest of the dashboard
// doesn't need to know anything about payments.

import { useEffect, useState } from 'react';
import { Banknote, CalendarDays, CalendarRange, Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { formatMoney, formatShortDay } from '../utils';
import StatCard from './StatCard';

const RANGES = [7, 30, 90];

// Colours for the payment-result rows (same palette as the rest of the panel).
const RESULT_ROWS = [
  { key: 'completed', label: 'Paid', color: '#35c46a' },
  { key: 'failed', label: 'Failed', color: '#e5555f' },
  { key: 'cancelled', label: 'Cancelled', color: '#8890a0' },
  { key: 'abandoned', label: 'No response', color: '#e3a13a' },
  { key: 'pending', label: 'Waiting for PIN', color: '#4d95e6' },
];

const tooltipStyle = {
  background: '#1e2229',
  border: '1px solid #262b33',
  borderRadius: 8,
  fontSize: 12.5,
};

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// One line with a label, a number and a thin coloured bar showing the share.
function BreakdownRow({ label, valueText, percent, color }) {
  return (
    <div className="bar-row">
      <div className="bar-row-top">
        <span>{label}</span>
        <span className="bar-row-value">{valueText}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${Math.max(percent, 2)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function SalesOverview() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the numbers again whenever the admin picks a different range.
  useEffect(() => {
    let ignore = false; // stops an old, slow response from replacing a newer one

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.getPaymentsSummary(days);
        if (!ignore) setSummary(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [days]);

  const header = (
    <div className="section-head">
      <div>
        <h2>Sales</h2>
        <p>Money received through M-Pesa. Amounts are in Kenya Shillings.</p>
      </div>
      <div className="range-toggle" role="group" aria-label="Date range">
        {RANGES.map((range) => (
          <button
            key={range}
            className={range === days ? 'active' : ''}
            onClick={() => setDays(range)}
            disabled={isLoading && range === days}
          >
            {range} days
          </button>
        ))}
      </div>
    </div>
  );

  if (!summary) {
    return (
      <section className="sales-section">
        {header}
        <div className="panel">
          {error ? (
            <div className="empty-state error-text">Could not load sales numbers: {error}</div>
          ) : (
            <div className="empty-state">Loading sales numbers...</div>
          )}
        </div>
      </section>
    );
  }

  const { revenue, payments, attempts, byPlan, failureReasons, daily } = summary;
  const hasSalesInWindow = payments.window > 0;

  // Percent bars: each row is a share of the biggest row in its group.
  const maxPlanRevenue = Math.max(1, ...byPlan.map((p) => p.revenue));
  const maxFailureCount = Math.max(1, ...failureReasons.map((r) => r.count));

  // The growth chip next to the big number.
  let growth = null;
  if (revenue.growthPercent !== null) {
    const up = revenue.growthPercent >= 0;
    growth = (
      <span className={`growth-chip ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {up ? '+' : ''}
        {revenue.growthPercent}% vs previous {summary.days} days
      </span>
    );
  }

  return (
    <section className="sales-section" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      {header}
      {error && <p className="error-text" style={{ marginBottom: 14 }}>Could not refresh: {error}</p>}

      <div className="stat-grid">
        <StatCard
          label="Revenue today"
          value={formatMoney(revenue.today)}
          icon={Banknote}
          tone="success"
          hint={plural(payments.today, 'payment')}
        />
        <StatCard
          label="Last 7 days"
          value={formatMoney(revenue.last7Days)}
          icon={CalendarDays}
          tone="accent"
          hint={plural(payments.last7Days, 'payment')}
        />
        <StatCard
          label="This month"
          value={formatMoney(revenue.thisMonth)}
          icon={CalendarRange}
          tone="info"
          hint={plural(payments.thisMonth, 'payment')}
        />
        <StatCard
          label="All-time revenue"
          value={formatMoney(revenue.allTime)}
          icon={Landmark}
          tone="warning"
          hint={plural(payments.allTime, 'payment')}
        />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Revenue, last {summary.days} days</h3>
            <span className="panel-subtext">Nairobi time</span>
          </div>

          <div className="big-number-row">
            <span className="big-number">{formatMoney(revenue.window)}</span>
            {growth}
          </div>
          <p className="big-number-sub">
            {plural(payments.window, 'payment')}
            {hasSalesInWindow && ` · average ${formatMoney(summary.averagePayment)} each`}
          </p>

          {!hasSalesInWindow ? (
            <div className="empty-state">No payments in this period yet.</div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={daily} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#262b33" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDay}
                    tick={{ fill: '#656d7a', fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: '#656d7a', fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={tooltipStyle}
                    labelFormatter={formatShortDay}
                    formatter={(value, name, item) => [
                      `${formatMoney(value)} (${plural(item.payload.payments, 'payment')})`,
                      'Revenue',
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#35d0b8" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ height: 8 }} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Payment results</h3>
            <span className="panel-subtext">Last {summary.days} days</span>
          </div>

          {attempts.total === 0 ? (
            <div className="empty-state">No payment attempts yet.</div>
          ) : (
            <>
              <div className="big-number-row">
                <span className="big-number">{attempts.successRate === null ? '—' : `${attempts.successRate}%`}</span>
                <span className="big-number-label">success rate</span>
              </div>
              <p className="big-number-sub">
                Out of {plural(attempts.total, 'attempt')}. Prompts still waiting for a PIN are not counted.
              </p>
              <div>
                {RESULT_ROWS.map((row) => (
                  <div className="legend-row" key={row.key}>
                    <span>
                      <span className="legend-dot" style={{ background: row.color }} />
                      {row.label}
                    </span>
                    <span>{attempts[row.key]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ height: 8 }} />
        </div>
      </div>

      <div className="panel-grid even">
        <div className="panel">
          <div className="panel-header">
            <h3>Revenue by plan</h3>
            <span className="panel-subtext">Last {summary.days} days</span>
          </div>
          {byPlan.length === 0 ? (
            <div className="empty-state">No paid subscriptions in this period.</div>
          ) : (
            byPlan.map((plan) => (
              <BreakdownRow
                key={plan.planType}
                label={`${plan.planType[0].toUpperCase()}${plan.planType.slice(1)} (${plural(plan.payments, 'payment')})`}
                valueText={formatMoney(plan.revenue)}
                percent={(plan.revenue / maxPlanRevenue) * 100}
                color="#35d0b8"
              />
            ))
          )}
          <div style={{ height: 8 }} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Why payments fail</h3>
            <span className="panel-subtext">Last {summary.days} days</span>
          </div>
          {failureReasons.length === 0 ? (
            <div className="empty-state">No failed or cancelled payments in this period.</div>
          ) : (
            failureReasons.map((item) => (
              <BreakdownRow
                key={item.reason}
                label={item.reason}
                valueText={String(item.count)}
                percent={(item.count / maxFailureCount) * 100}
                color="#e5555f"
              />
            ))
          )}
          <div style={{ height: 8 }} />
        </div>
      </div>

      <p className="footnote">
        Revenue only counts payments confirmed by M-Pesa. Users you add, extend or reactivate by hand
        are not counted because no money went through the app.
      </p>
    </section>
  );
}
