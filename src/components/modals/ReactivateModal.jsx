import { useState } from 'react';

const PLAN_OPTIONS = ['monthly', 'yearly'];

export default function ReactivateModal({ user, onCancel, onConfirm, isBusy, error }) {
  const [planType, setPlanType] = useState(user.plan_type || 'monthly');
  const [days, setDays] = useState(planType === 'yearly' ? 365 : 30);

  function handlePlanChange(value) {
    setPlanType(value);
    setDays(value === 'yearly' ? 365 : 30);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reactivate subscription</h3>
          <p>{user.email}</p>
        </div>
        <div className="modal-body">
          <label className="field">
            Plan
            <select value={planType} onChange={(e) => handlePlanChange(e.target.value)}>
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Duration (days)
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={isBusy || Number(days) <= 0}
            onClick={() => onConfirm({ planType, days: Number(days) })}
          >
            {isBusy ? 'Reactivating...' : 'Reactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}
