import Avatar from '../components/Avatar';

export default function ProfilePage({ admin, onLogout }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin profile</h1>
          <p>Your account on Movie Explorer's admin panel.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <Avatar name={admin?.name || admin?.email} size={52} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              {admin?.name || 'Admin'}
            </div>
            <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>{admin?.email}</div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
