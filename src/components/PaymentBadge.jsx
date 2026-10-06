import { PAYMENT_STATUS_META } from '../utils';

// The coloured pill for a payment: Paid / Failed / Cancelled / Pending / No response.
export default function PaymentBadge({ status }) {
  const meta = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.PENDING;
  return (
    <span className={`status-badge ${meta.badge}`}>
      <span className={`legend-dot ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
