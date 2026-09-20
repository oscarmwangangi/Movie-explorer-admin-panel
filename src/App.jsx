import { useEffect, useState } from 'react';
import { Bell, CreditCard, Settings, Activity } from 'lucide-react';
import { api, setToken } from './api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import UserDetailsDrawer from './components/UserDetailsDrawer';
import AddUserModal from './components/modals/AddUserModal';
import ExtendSubscriptionModal from './components/modals/ExtendSubscriptionModal';
import ReactivateModal from './components/modals/ReactivateModal';
import ConfirmModal from './components/modals/ConfirmModal';
import PasswordResultModal from './components/modals/PasswordResultModal';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'extend' | 'end' | 'reactivate' | 'add' | 'reset' | 'disable' | 'enable' | 'delete', user? }
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
    if (admin) loadUsers();
  }, [admin]);

  function handleLoginSuccess(user) {
    setAdmin(user);
  }

  function handleLogout() {
    setToken(null);
    setAdmin(null);
    setUsers([]);
    setCurrentPage('dashboard');
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
        />

        <div className="page-content">
          {isLoading && users.length === 0 ? (
            <p className="page-message">Loading users...</p>
          ) : loadError ? (
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

              {currentPage === 'payments' && (
                <PlaceholderPage
                  title="Payments"
                  description="Payment history for Movie Explorer subscribers."
                  icon={CreditCard}
                />
              )}

              {currentPage === 'activity' && (
                <PlaceholderPage
                  title="Activity"
                  description="Recent admin and account activity."
                  icon={Activity}
                />
              )}

              {currentPage === 'notifications' && (
                <PlaceholderPage
                  title="Notifications"
                  description="Alerts about expirations, failed payments and new sign-ups."
                  icon={Bell}
                />
              )}

              {currentPage === 'settings' && (
                <PlaceholderPage
                  title="Settings"
                  description="Admin panel configuration."
                  icon={Settings}
                />
              )}

              {currentPage === 'profile' && <ProfilePage admin={admin} onLogout={handleLogout} />}
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
