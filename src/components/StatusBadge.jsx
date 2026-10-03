import { STATUS_META } from '../utils';

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.none;
  return (
    <span className={`status-badge badge-${status in STATUS_META ? status : 'none'}`}>
      <span className={`legend-dot ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
