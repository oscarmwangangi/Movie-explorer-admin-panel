// This file is the ONLY place we call fetch(). Keeping all API calls
// in one file makes it easy to find and change later.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// After logging in, we save the token here so every other request
// can use it. Real apps might use localStorage - we keep it simple.
let authToken = null;

export function setToken(token) {
  authToken = token;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

export const api = {
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
};
