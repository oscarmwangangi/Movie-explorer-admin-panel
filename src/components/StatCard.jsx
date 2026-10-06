export default function StatCard({ label, value, icon: Icon, tone = 'accent', hint }) {
  const toneVars = {
    accent: { bg: 'var(--accent-wash)', color: 'var(--accent)' },
    success: { bg: 'var(--success-wash)', color: 'var(--success)' },
    warning: { bg: 'var(--warning-wash)', color: 'var(--warning)' },
    danger: { bg: 'var(--danger-wash)', color: 'var(--danger)' },
    info: { bg: 'var(--info-wash)', color: 'var(--info)' },
  }[tone];

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: toneVars.bg, color: toneVars.color }}>
          <Icon size={15} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
