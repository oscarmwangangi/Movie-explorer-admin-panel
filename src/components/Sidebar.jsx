import {
  Clapperboard,
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Activity,
  Settings,
  UserPlus,
  Bell,
  User,
  LogOut,
} from 'lucide-react';

const MAIN_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { key: 'payments', label: 'Payments', icon: Receipt },
  { key: 'activity', label: 'Activity', icon: Activity },
];

const MANAGEMENT_ITEMS = [
  { key: 'add-user', label: 'Add user', icon: UserPlus },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, onAddUser, isOpen, onClose, admin, onLogout }) {
  function go(key) {
    if (key === 'add-user') {
      onNavigate('users');
      onAddUser();
    } else {
      onNavigate(key);
    }
    onClose();
  }

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Clapperboard size={17} />
          </div>
          <span>Movie Explorer</span>
        </div>

        <nav>
          <div className="nav-group">
            <div className="nav-label">MAIN</div>
            {MAIN_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`nav-item ${currentPage === key ? 'active' : ''}`}
                onClick={() => go(key)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <div className="nav-label">MANAGEMENT</div>
            {MANAGEMENT_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`nav-item ${currentPage === key ? 'active' : ''}`}
                onClick={() => go(key)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-group" style={{ marginBottom: 8 }}>
            <button
              className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => go('profile')}
            >
              <User size={17} />
              {admin?.name || admin?.email || 'Admin'}
            </button>
            <button className="nav-item" onClick={onLogout}>
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
