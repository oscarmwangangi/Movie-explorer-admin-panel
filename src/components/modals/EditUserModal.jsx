import { useState } from 'react';

// Lets the admin change a user's name and/or email.
// onConfirm receives only the fields that actually changed.
export default function EditUserModal({ user, onCancel, onConfirm, isBusy, error }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [formError, setFormError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const changes = {};
    if (name.trim() !== (user.name || '')) changes.name = name.trim();
    if (email.trim() !== user.email) changes.email = email.trim();

    if (Object.keys(changes).length === 0) {
      setFormError('Nothing changed yet.');
      return;
    }
    if (changes.name !== undefined && !changes.name) {
      setFormError('Name cannot be empty.');
      return;
    }
    onConfirm(changes);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3>Edit user</h3>
          <p>Changing the email means the user logs in with the new email from now on.</p>
        </div>

        <div className="modal-body">
          <label className="field">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          {(formError || error) && <p className="error-text">{formError || error}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
