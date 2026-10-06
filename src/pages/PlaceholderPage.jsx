export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="panel">
        <div className="empty-state" style={{ padding: '56px 16px' }}>
          {Icon && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--text-faint)' }}>
              <Icon size={28} />
            </div>
          )}
          This section needs a backend endpoint that doesn't exist yet, so it's left
          empty rather than showing placeholder data.
        </div>
      </div>
    </div>
  );
}
