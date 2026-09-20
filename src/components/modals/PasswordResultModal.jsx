import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function PasswordResultModal({ email, password, onDone }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context); the
      // password is still shown on screen so the admin can select it.
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Password reset</h3>
          <p>{email}</p>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13.5 }}>
            Share this temporary password with the user. It won't be shown again.
          </p>
          <div className="generated-password">
            <span>{password}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
