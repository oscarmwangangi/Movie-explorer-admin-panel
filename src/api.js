// This file is the ONLY place we call fetch(). Keeping all API calls
// in one file makes it easy to find and change later.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// After logging in, we save the token here so every other request
// can use it. Real apps might use localStorage - we keep it simple.
let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

// A small wrapper around fetch that adds the auth header and turns
// error responses into thrown errors, so components can just try/catch.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });

  // Some endpoints (e.g. DELETE) may return no body.
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
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
};
