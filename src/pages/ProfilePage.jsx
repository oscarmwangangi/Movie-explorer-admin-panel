import { useState } from 'react';
import Avatar from '../components/Avatar';
import { api } from '../api';

// Small form helper: shows a green or red message under a form.
function Feedback({ result }) {
  if (!result) return null;
  return <p className={result.ok ? 'success-text' : 'error-text'}>{result.text}</p>;
}

export default function ProfilePage({ admin, onLogout, onEmailChanged }) {
  // --- change email ---
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailResult, setEmailResult] = useState(null);
  const [emailBusy, setEmailBusy] = useState(false);

  // --- change password ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResult, setPasswordResult] = useState(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailResult(null);
    setEmailBusy(true);
    try {
      const data = await api.changeEmail(newEmail.trim(), emailPassword);
      onEmailChanged(data.email);
      setEmailResult({ ok: true, text: 'Email updated.' });
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailResult({ ok: false, text: err.message });
    } finally {
      setEmailBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordResult(null);
    if (newPassword.length < 8) {
      setPasswordResult({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordResult({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    setPasswordBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordResult({ ok: true, text: 'Password updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordResult({ ok: false, text: err.message });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin profile</h1>
          <p>Your account on Movie Explorer's admin panel.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <Avatar name={admin?.name || admin?.email} size={52} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                {admin?.name || 'Admin'}
              </div>
              <div style={{ color: 'var(--text-faint)', fontSize: 13, overflowWrap: 'anywhere' }}>
                {admin?.email}
              </div>
            </div>
          </div>
          <button className="btn btn-danger" onClick={onLogout}>
            Log out
          </button>
        </div>

        <form className="panel form-panel" onSubmit={handleEmailSubmit}>
          <h3>Change email</h3>
          <label className="field">
            New email
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </label>
          <label className="field">
            Your password
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <Feedback result={emailResult} />
          <button className="btn btn-primary" type="submit" disabled={emailBusy}>
            {emailBusy ? 'Saving...' : 'Update email'}
          </button>
        </form>

        <form className="panel form-panel" onSubmit={handlePasswordSubmit}>
          <h3>Change password</h3>
          <label className="field">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="field">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="field">
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <Feedback result={passwordResult} />
          <button className="btn btn-primary" type="submit" disabled={passwordBusy}>
            {passwordBusy ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
