// This file is the ONLY place we call fetch(). Keeping all API calls
// in one file makes it easy to find and change later.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- Keeping the admin logged in -------------------------------------
// We save the token (and basic admin info) in the browser's localStorage,
// so refreshing the page does NOT log you out. It is removed on logout,
// or automatically when the server says the token is no longer valid.
const SESSION_KEY = 'movie-explorer-admin-session';

// localStorage can throw (private mode, blocked storage), so every use is wrapped.
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  } catch {
    // Not fatal: the admin just has to log in again after a refresh.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// The token used for every request. Starts from the saved session.
let authToken = loadSession()?.token || null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

// App.jsx registers a function here. We call it when the server rejects
// our token (expired / account disabled) so the app can send you to the login page.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// A small wrapper around fetch that adds the auth header and turns
// error responses into thrown errors, so components can just try/catch.
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // fetch itself failed = no internet, or the server is asleep/down.
    const networkError = new Error('Cannot reach the server. Check your connection and try again.');
    networkError.isNetworkError = true;
    throw networkError;
  }

  // Some endpoints (e.g. DELETE) may return no body, and a proxy error
  // page is not JSON, so parsing is guarded.
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    // 401 while we HAD a token = the session is no longer valid.
    if (response.status === 401 && authToken && onUnauthorized) {
      onUnauthorized();
    }
    const error = new Error(data.error || 'Something went wrong.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // --- Existing endpoints, already used elsewhere. Left untouched. ---
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getUsers: () => request('/api/admin/users'),

  extendSubscription: (userId, days) =>
    request(`/api/admin/users/${userId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  endSubscription: (userId) =>
    request(`/api/admin/users/${userId}/end`, {
      method: 'POST',
    }),

  // --- New admin endpoints added to the backend for this redesign. ---
  createUser: (payload) =>
    request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reactivateSubscription: (userId, { planType, days }) =>
    request(`/api/admin/users/${userId}/reactivate`, {
      method: 'POST',
      body: JSON.stringify({ planType, days }),
    }),

  resetPassword: (userId) =>
    request(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
    }),

  disableAccount: (userId) =>
    request(`/api/admin/users/${userId}/disable`, {
      method: 'POST',
    }),

  enableAccount: (userId) =>
    request(`/api/admin/users/${userId}/enable`, {
      method: 'POST',
    }),

  deleteAccount: (userId) =>
    request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  // --- M-Pesa sales numbers ---

  // Revenue, payment counts, success rate and the daily chart.
  // days can be 7, 30 or 90.
  getPaymentsSummary: (days = 30) => request(`/api/admin/payments/summary?days=${days}`),

  // The payment list. params: { status, search, page, pageSize }
  getPayments: ({ status = '', search = '', page = 1, pageSize = 20 } = {}) => {
    const query = new URLSearchParams({ status, search, page, pageSize });
    return request(`/api/admin/payments?${query.toString()}`);
  },

  // --- Added in this update ---

  // Who am I? Used on page refresh to check the saved token is still good.
  getMe: () => request('/api/auth/me'),

  // Edit a user. payload: { name?, email? }
  updateUser: (userId, payload) =>
    request(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // One user + their recent payments
  getUser: (userId) => request(`/api/admin/users/${userId}`),

  // On/off switches: { registrationEnabled, loginEnabled, blockMessage }
  getSettings: () => request('/api/admin/settings'),
  saveSettings: (payload) =>
    request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getActivity: ({ page = 1, pageSize = 20 } = {}) =>
    request(`/api/admin/activity?page=${page}&pageSize=${pageSize}`),

  getNotifications: () => request('/api/admin/notifications'),

  // The admin's own account
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  changeEmail: (newEmail, password) =>
    request('/api/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail, password }),
    }),
};
