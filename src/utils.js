// Small, dependency-free helpers shared across the app.

export function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Days remaining until a date; negative means already past.
export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function addDuration(startDate, unit) {
  const d = new Date(startDate);
  if (unit === 'monthly') d.setMonth(d.getMonth() + 1);
  if (unit === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = '';
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const arr = new Uint32Array(length);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const STATUS_META = {
  active: { label: 'Active', dot: 'dot-active' },
  pending: { label: 'Pending', dot: 'dot-pending' },
  expired: { label: 'Expired', dot: 'dot-expired' },
  cancelled: { label: 'Cancelled', dot: 'dot-cancelled' },
  none: { label: 'No subscription', dot: 'dot-none' },
};

// ---------- Money + payments (M-Pesa) ----------

// 1300 -> "KES 1,300"
export function formatMoney(amount) {
  const number = Number(amount) || 0;
  return `KES ${number.toLocaleString('en-KE')}`;
}

// "2026-09-02" -> "Sep 2". We build the date from its parts (instead of
// new Date("2026-09-02")) so the browser's timezone can't shift it by a day.
export function formatShortDay(isoDate) {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// How each payment status is shown. "key" matches the status the backend sends.
export const PAYMENT_STATUS_META = {
  COMPLETED: { label: 'Paid', badge: 'badge-completed', dot: 'dot-completed' },
  FAILED: { label: 'Failed', badge: 'badge-failed', dot: 'dot-failed' },
  CANCELLED: { label: 'Cancelled', badge: 'badge-cancelled', dot: 'dot-cancelled' },
  PENDING: { label: 'Pending', badge: 'badge-pending', dot: 'dot-pending' },
  ABANDONED: { label: 'No response', badge: 'badge-abandoned', dot: 'dot-abandoned' },
};
