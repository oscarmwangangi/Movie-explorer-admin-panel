// The Payments page: every M-Pesa payment attempt, newest first.
// The admin can filter by result, search, and flip through pages.

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { formatDateTime, formatMoney } from '../utils';
import PaymentBadge from '../components/PaymentBadge';

const PAGE_SIZE = 20;

// The filter buttons. value '' means "show everything".
const FILTERS = [
  { value: '', label: 'All' },
  { value: 'COMPLETED', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ABANDONED', label: 'No response' },
];

export default function PaymentsPage() {
  const [status, setStatus] = useState('');
  const [searchText, setSearchText] = useState(''); // what the admin is typing
  const [search, setSearch] = useState(''); // what we actually search for (after a short pause)
  const [page, setPage] = useState(1);
  const [reloadCounter, setReloadCounter] = useState(0); // bump it to reload the list

  const [data, setData] = useState({ payments: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Wait 350ms after the admin stops typing before searching,
  // so we don't call the server on every single key press.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Load the list whenever the filter, search, page or reload button changes.
  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const result = await api.getPayments({ status, search, page, pageSize: PAGE_SIZE });
        if (!ignore) setData(result);
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
  }, [status, search, page, reloadCounter]);

  function changeFilter(value) {
    setStatus(value);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const firstRow = data.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(page * PAGE_SIZE, data.total);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Every M-Pesa payment attempt, newest first.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReloadCounter((n) => n + 1)}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search email, phone or receipt..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="range-toggle" role="group" aria-label="Filter by result">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={filter.value === status ? 'active' : ''}
              onClick={() => changeFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

      {!error && data.payments.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            {isLoading ? 'Loading payments...' : 'No payments match these filters.'}
          </div>
        </div>
      ) : (
        <div className="table-scroll" style={{ opacity: isLoading ? 0.6 : 1 }}>
          <table className="stack-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Phone</th>
                <th>Result</th>
                <th>M-Pesa receipt</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment) => (
                <tr key={payment.id}>
                  <td data-label="Date">{formatDateTime(payment.createdAt)}</td>
                  <td data-label="Customer">
                    <div className="user-name" style={{ fontWeight: 600 }}>
                      {payment.userName || payment.userEmail.split('@')[0]}
                    </div>
                    <div className="user-email">{payment.userEmail}</div>
                  </td>
                  <td data-label="Plan" style={{ textTransform: 'capitalize' }}>{payment.planType}</td>
                  <td data-label="Amount" style={{ fontWeight: 600 }}>{formatMoney(payment.amount)}</td>
                  <td data-label="Phone">{payment.phoneNumber}</td>
                  <td data-label="Result">
                    <PaymentBadge status={payment.status} />
                    {payment.reason && <div className="user-email" style={{ marginTop: 4 }}>{payment.reason}</div>}
                  </td>
                  <td data-label="Receipt" className="mono">{payment.receipt || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.total > 0 && (
        <div className="pager">
          <span>
            Showing {firstRow}–{lastRow} of {data.total}
          </span>
          <div className="pager-buttons">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
