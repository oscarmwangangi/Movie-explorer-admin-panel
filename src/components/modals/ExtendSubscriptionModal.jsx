import { useMemo, useState } from 'react';
import { formatDate } from '../../utils';

export default function ExtendSubscriptionModal({ user, onCancel, onConfirm, isBusy, error }) {
  const [days, setDays] = useState(30);

  const newExpiration = useMemo(() => {
    const base = user.expires_at ? new Date(user.expires_at) : new Date();
    const d = new Date(base);
    d.setDate(d.getDate() + Number(days || 0));
    return d;
  }, [days, user.expires_at]);

  const isValid = Number(days) > 0;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Extend subscription</h3>
          <p>{user.email}</p>
        </div>
        <div className="modal-body">
          <div className="inline-fact">
            <span>Current expiration</span>
            <strong>{formatDate(user.expires_at)}</strong>
          </div>

          <label className="field">
            Extend by (days)
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </label>

          <div className="inline-fact">
            <span>New expiration</span>
            <strong>{formatDate(newExpiration)}</strong>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!isValid || isBusy}
            onClick={() => onConfirm(Number(days))}
          >
            {isBusy ? 'Extending...' : 'Extend subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
