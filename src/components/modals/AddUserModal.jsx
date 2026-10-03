import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { addDuration, formatDate, generatePassword } from '../../utils';

const PLAN_OPTIONS = [
  { value: 'none', label: 'No subscription' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const STATUS_OPTIONS = ['active', 'pending'];

export default function AddUserModal({ onCancel, onConfirm, isBusy, serverError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planType, setPlanType] = useState('monthly');
  const [status, setStatus] = useState('active');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [formError, setFormError] = useState('');

  const startDate = useMemo(() => new Date(), []);
  const expiresAt = useMemo(() => {
    if (planType === 'none') return null;
    return addDuration(startDate, planType);
  }, [planType, startDate]);

  function handleGeneratePassword() {
    const generated = generatePassword();
    setPassword(generated);
    setConfirmPassword(generated);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Name, email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    onConfirm({
      name: name.trim(),
      email: email.trim(),
      password,
      planType: planType === 'none' ? null : planType,
      status: planType === 'none' ? 'none' : status,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      sendWelcomeEmail,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h3>Create user</h3>
          <p>Adds a real account through the backend — not a placeholder row.</p>
        </div>

        <div className="modal-body">
          <label className="field">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <div className="modal-row-2">
            <label className="field">
              Password
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label className="field">
              Confirm password
              <input
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <button type="button" className="btn btn-ghost btn-sm" onClick={handleGeneratePassword} style={{ alignSelf: 'flex-start' }}>
            <RefreshCw size={13} />
            Generate temporary password
          </button>

          <div className="modal-row-2">
            <label className="field">
              Subscription
              <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={planType === 'none'}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {planType !== 'none' && (
            <div className="inline-fact">
              <span>Expires</span>
              <strong>{formatDate(expiresAt)} (calculated server-side)</strong>
            </div>
          )}

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={sendWelcomeEmail}
              onChange={(e) => setSendWelcomeEmail(e.target.checked)}
            />
            Send welcome email with login credentials
          </label>

          {(formError || serverError) && <p className="error-text">{formError || serverError}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? 'Creating...' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  );
}
