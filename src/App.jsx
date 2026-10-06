import { useEffect, useState } from 'react';
import {
  api,
  setToken,
  loadSession,
  saveSession,
  clearSession,
  setUnauthorizedHandler,
} from './api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import ActivityPage from './pages/ActivityPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import UserDetailsDrawer from './components/UserDetailsDrawer';
import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import ExtendSubscriptionModal from './components/modals/ExtendSubscriptionModal';
import ReactivateModal from './components/modals/ReactivateModal';
import ConfirmModal from './components/modals/ConfirmModal';
import PasswordResultModal from './components/modals/PasswordResultModal';

// The page you were on is remembered too, so a refresh keeps you where you were.
const PAGE_KEY = 'movie-explorer-admin-page';
const VALID_PAGES = [
  'dashboard', 'users', 'subscriptions', 'payments',
  'activity', 'notifications', 'settings', 'profile',
];

// Pages that need the users list. Others (settings, activity...) load their own data.
const USER_PAGES = ['dashboard', 'users', 'subscriptions'];

function loadSavedPage() {
  try {
    const saved = localStorage.getItem(PAGE_KEY);
    return VALID_PAGES.includes(saved) ? saved : 'dashboard';
  } catch {
    return 'dashboard';
  }
}

export default function App() {
  // Start with the admin from the saved session (if any), so a refresh
  // does not flash the login page. We double-check it with the server below.
  const [admin, setAdmin] = useState(() => loadSession()?.user || null);
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(loadSession()?.token));
  const [currentPage, setCurrentPage] = useState(loadSavedPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'edit' | 'extend' | 'end' | 'reactivate' | 'add' | 'reset' | 'disable' | 'enable' | 'delete', user? }
  const [modalError, setModalError] = useState('');
  const [modalBusy, setModalBusy] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  async function loadUsers() {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (admin && !isCheckingSession) loadUsers();
  }, [admin, isCheckingSession]);

  // Remember the current page.
  useEffect(() => {
    try {
      localStorage.setItem(PAGE_KEY, currentPage);
    } catch {
      // ignore - not important
    }
  }, [currentPage]);

  // If the server ever says "your token is no longer valid", log out cleanly.
  useEffect(() => {
    setUnauthorizedHandler(() => handleLogout());
    return () => setUnauthorizedHandler(null);
  }, []);

  // On first load: if we have a saved token, ask the server if it is still good.
  useEffect(() => {
    if (!isCheckingSession) return;
    api
      .getMe()
      .then((me) => {
        if (!me.isAdmin) {
          handleLogout();
          return;
        }
        const freshAdmin = { id: me.id, email: me.email, name: me.name, isAdmin: true };
        setAdmin(freshAdmin);
        saveSession(loadSession()?.token, freshAdmin);
      })
      .catch((err) => {
        // 401/403 = token rejected -> log out. A network error (server asleep,
        // no internet) keeps the saved login, and the pages show their own error.
        if (err.status === 401 || err.status === 403) handleLogout();
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  function handleLoginSuccess(user) {
    setAdmin(user);
  }

  function handleLogout() {
    setToken(null);
    clearSession();
    setAdmin(null);
    setUsers([]);
    setCurrentPage('dashboard');
    setSelectedUser(null);
    setModal(null);
  }

  // The admin changed their own email on the Profile page.
  function handleOwnEmailChanged(newEmail) {
    const updated = { ...admin, email: newEmail };
    setAdmin(updated);
    saveSession(loadSession()?.token, updated);
  }

  // Used by the Notifications page: open a user's details by id.
  function openUserById(userId) {
    const user = users.find((u) => u.id === userId);
    if (user) setSelectedUser(user);
  }

  function openDrawer(user) {
    setSelectedUser(user);
  }

  function closeDrawer() {
    setSelectedUser(null);
  }

  function openModal(type, user) {
    setModalError('');
    setModal({ type, user });
  }

  function closeModal() {
    setModal(null);
    setModalError('');
    setModalBusy(false);
    setResetPasswordValue('');
  }

  async function refreshAndSync() {
    await loadUsers();
  }

  async function handleExtendConfirm(days) {
    setModalBusy(true);
    setBusyUserId(modal.user.id);
    try {
      await api.extendSubscription(modal.user.id, days);
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
      setBusyUserId(null);
    }
  }

  async function handleEndConfirm() {
    setModalBusy(true);
    setBusyUserId(modal.user.id);
    try {
      await api.endSubscription(modal.user.id);
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
      setBusyUserId(null);
    }
  }

  async function handleReactivateConfirm({ planType, days }) {
    setModalBusy(true);
    setBusyUserId(modal.user.id);
    try {
      await api.reactivateSubscription(modal.user.id, { planType, days });
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
      setBusyUserId(null);
    }
  }

  async function handleAddUserConfirm(payload) {
    setModalBusy(true);
    try {
      await api.createUser(payload);
      await refreshAndSync();
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  async function handleEditConfirm(changes) {
    setModalBusy(true);
    try {
      await api.updateUser(modal.user.id, changes);
      await refreshAndSync();
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  async function handleResetPasswordConfirm() {
    setModalBusy(true);
    try {
      const data = await api.resetPassword(modal.user.id);
      setResetPasswordValue(data.temporaryPassword);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  async function handleDisableConfirm() {
    setModalBusy(true);
    try {
      await api.disableAccount(modal.user.id);
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  async function handleEnableConfirm() {
    setModalBusy(true);
    try {
      await api.enableAccount(modal.user.id);
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  async function handleDeleteConfirm() {
    setModalBusy(true);
    try {
      await api.deleteAccount(modal.user.id);
      await refreshAndSync();
      closeModal();
      closeDrawer();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  }

  if (isCheckingSession) {
    return <p className="page-message">Loading...</p>;
  }

  if (!admin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddUser={() => openModal('add')}
        admin={admin}
        onLogout={handleLogout}
      />

      <div className="app-main">
        <TopBar
          currentPage={currentPage}
          onMenuClick={() => setSidebarOpen(true)}
          search={search}
          onSearchChange={setSearch}
          showSearch={false}
          admin={admin}
          onProfileClick={() => setCurrentPage('profile')}
          onNotificationsClick={() => setCurrentPage('notifications')}
        />

        <div className="page-content">
          {USER_PAGES.includes(currentPage) && isLoading && users.length === 0 ? (
            <p className="page-message">Loading users...</p>
          ) : USER_PAGES.includes(currentPage) && loadError ? (
            <p className="page-message error-text" style={{ display: 'inline-block' }}>
              {loadError}
            </p>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <DashboardPage
                  users={users}
                  onRowClick={openDrawer}
                  onExtend={(u) => openModal('extend', u)}
                  onEnd={(u) => openModal('end', u)}
                  busyUserId={busyUserId}
                />
              )}

              {currentPage === 'users' && (
                <UsersPage
                  users={users}
                  search={search}
                  onSearchChange={setSearch}
                  onRowClick={openDrawer}
                  onExtend={(u) => openModal('extend', u)}
                  onEnd={(u) => openModal('end', u)}
                  onAddUser={() => openModal('add')}
                  busyUserId={busyUserId}
                />
              )}

              {currentPage === 'subscriptions' && (
                <SubscriptionsPage
                  users={users}
                  onRowClick={openDrawer}
                  onExtend={(u) => openModal('extend', u)}
                  onEnd={(u) => openModal('end', u)}
                  busyUserId={busyUserId}
                />
              )}

              {currentPage === 'payments' && <PaymentsPage />}

              {currentPage === 'activity' && <ActivityPage />}

              {currentPage === 'notifications' && <NotificationsPage onOpenUser={openUserById} />}

              {currentPage === 'settings' && <SettingsPage />}

              {currentPage === 'profile' && <ProfilePage admin={admin} onLogout={handleLogout} onEmailChanged={handleOwnEmailChanged} />}
            </>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailsDrawer
          user={users.find((u) => u.id === selectedUser.id) || selectedUser}
          onClose={closeDrawer}
          onExtend={(u) => openModal('extend', u)}
          onEnd={(u) => openModal('end', u)}
          onReactivate={(u) => openModal('reactivate', u)}
          onResetPassword={(u) => openModal('reset', u)}
          onDisable={(u) => openModal('disable', u)}
          onEnable={(u) => openModal('enable', u)}
          onDelete={(u) => openModal('delete', u)}
          onEdit={(u) => openModal('edit', u)}
        />
      )}

      {modal?.type === 'edit' && (
        <EditUserModal
          user={modal.user}
          onCancel={closeModal}
          onConfirm={handleEditConfirm}
          isBusy={modalBusy}
          error={modalError}
        />
      )}

      {modal?.type === 'extend' && (
        <ExtendSubscriptionModal
          user={modal.user}
          onCancel={closeModal}
          onConfirm={handleExtendConfirm}
          isBusy={modalBusy}
          error={modalError}
        />
      )}

      {modal?.type === 'end' && (
        <ConfirmModal
          title="End subscription?"
          description={`${modal.user.name || modal.user.email} will lose access when the subscription is ended.`}
          confirmLabel="End subscription"
          danger
          isBusy={modalBusy}
          error={modalError}
          onCancel={closeModal}
          onConfirm={handleEndConfirm}
        />
      )}

      {modal?.type === 'reactivate' && (
        <ReactivateModal
          user={modal.user}
          onCancel={closeModal}
          onConfirm={handleReactivateConfirm}
          isBusy={modalBusy}
          error={modalError}
        />
      )}

      {modal?.type === 'add' && (
        <AddUserModal
          onCancel={closeModal}
          onConfirm={handleAddUserConfirm}
          isBusy={modalBusy}
          serverError={modalError}
        />
      )}

      {modal?.type === 'reset' && !resetPasswordValue && (
        <ConfirmModal
          title="Reset password?"
          description={`Generate a new temporary password for ${modal.user.email}.`}
          confirmLabel="Reset password"
          isBusy={modalBusy}
          error={modalError}
          onCancel={closeModal}
          onConfirm={handleResetPasswordConfirm}
        />
      )}

      {modal?.type === 'reset' && resetPasswordValue && (
        <PasswordResultModal
          email={modal.user.email}
          password={resetPasswordValue}
          onDone={closeModal}
        />
      )}

      {modal?.type === 'disable' && (
        <ConfirmModal
          title="Disable account?"
          description={`${modal.user.name || modal.user.email} won't be able to sign in until this account is re-enabled.`}
          confirmLabel="Disable account"
          danger
          isBusy={modalBusy}
          error={modalError}
          onCancel={closeModal}
          onConfirm={handleDisableConfirm}
        />
      )}

      {modal?.type === 'enable' && (
        <ConfirmModal
          title="Enable account?"
          description={`${modal.user.name || modal.user.email} will be able to sign in again.`}
          confirmLabel="Enable account"
          isBusy={modalBusy}
          error={modalError}
          onCancel={closeModal}
          onConfirm={handleEnableConfirm}
        />
      )}

      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete account?"
          description={`This permanently removes ${modal.user.email} and their subscription history. This can't be undone.`}
          confirmLabel="Delete account"
          danger
          isBusy={modalBusy}
          error={modalError}
          onCancel={closeModal}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
