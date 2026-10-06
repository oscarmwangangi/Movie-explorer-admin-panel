import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import Avatar from './Avatar';

const TITLES = {
  dashboard: 'Dashboard',
  users: 'Users',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  activity: 'Activity',
  'add-user': 'Add user',
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Admin profile',
};

export default function TopBar({
  currentPage,
  onMenuClick,
  search,
  onSearchChange,
  showSearch,
  admin,
  onProfileClick,
  onNotificationsClick,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={19} />
        </button>
        <h2>{TITLES[currentPage] || 'Dashboard'}</h2>
      </div>

      <div className="topbar-right">
        {showSearch && (
          <div className="topbar-search">
            <Search size={15} />
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        <button className="icon-btn" aria-label="Notifications" onClick={onNotificationsClick}>
          <Bell size={16} />
        </button>
        <button className="admin-chip" onClick={onProfileClick}>
          <Avatar name={admin?.name || admin?.email} size={30} />
          <span className="admin-name">{admin?.name || admin?.email || 'Admin'}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
