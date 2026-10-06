import { useEffect, useState } from 'react';
import { api } from '../api';

// A simple on/off switch (see .switch in index.css).
function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="switch-knob" />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((data) => {
        setSettings(data.settings);
        setMessage(data.settings.block_message || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  // Saves one or more settings and shows what the server stored.
  async function save(payload) {
    setSaving(true);
    setError('');
    try {
      const data = await api.saveSettings(payload);
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className={error ? 'error-text' : 'page-message'}>{error || 'Loading settings...'}</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Control who can sign up and log in to the Movie Explorer app.</p>
        </div>
      </div>

      {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

      <div className="panel settings-panel">
        <div className="setting-row">
          <div>
            <div className="setting-title">Allow new sign-ups</div>
            <div className="setting-desc">
              When off, nobody can create a new account from the app. You can still add users here.
            </div>
          </div>
          <Switch
            label="Allow new sign-ups"
            checked={settings.registration_enabled}
            disabled={saving}
            onChange={(value) => save({ registrationEnabled: value })}
          />
        </div>

        <div className="setting-row">
          <div>
            <div className="setting-title">Allow user login</div>
            <div className="setting-desc">
              When off, normal users cannot log in (people already logged in stay logged in). Admins
              can always log in.
            </div>
          </div>
          <Switch
            label="Allow user login"
            checked={settings.login_enabled}
            disabled={saving}
            onChange={(value) => save({ loginEnabled: value })}
          />
        </div>

        <div className="setting-row" style={{ display: 'block' }}>
          <div className="setting-title">Message shown when blocked</div>
          <div className="setting-desc" style={{ marginBottom: 10 }}>
            Optional. Users see this text when sign-up or login is turned off.
          </div>
          <div className="setting-message-row">
            <input
              className="text-input"
              maxLength={200}
              placeholder="e.g. We are upgrading, back soon."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={saving || message === settings.block_message}
              onClick={() => save({ blockMessage: message })}
            >
              Save message
            </button>
          </div>
        </div>
      </div>

      <p className="footnote">
        To block just one person instead, open them in Users and choose "Disable account".
      </p>
    </div>
  );
}
