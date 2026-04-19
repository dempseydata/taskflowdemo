const priorityColors = {
  urgent: { color: 'var(--color-priority-urgent)', bg: '#fef2f2' },
  high:   { color: 'var(--color-priority-high)',   bg: '#fff7ed' },
  medium: { color: 'var(--color-priority-medium)', bg: '#fffbeb' },
  low:    { color: 'var(--color-priority-low)',     bg: '#f9fafb' },
};

export default function WorkloadMemberCard({ member, onClick, isSelected }) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cardStyle = {
    background: 'var(--color-surface)',
    border: isSelected
      ? '2px solid var(--color-primary)'
      : member.is_overloaded
        ? '2px solid var(--color-error)'
        : '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'box-shadow var(--transition-fast)',
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--border-radius-full)',
    background: member.avatar_color || 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-base)',
    flexShrink: 0,
  };

  const hasNoTasks = member.task_counts.total === 0;

  return (
    <div style={cardStyle} onClick={onClick}>
      {member.is_overloaded && (
        <div style={{
          background: 'var(--color-error-light)',
          color: 'var(--color-error)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          padding: 'var(--space-1) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }}>
          ⚠ Overloaded — {member.task_counts.urgent + member.task_counts.high} urgent/high tasks
        </div>
      )}

      <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={avatarStyle}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
            {member.name}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {member.role}
          </div>
        </div>
        {!hasNoTasks && (
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            textAlign: 'right',
          }}>
            {member.task_counts.total} tasks
          </div>
        )}
      </div>

      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderTop: '1px solid var(--color-border-light)',
        background: 'var(--color-bg)',
      }}>
        {hasNoTasks ? (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            No active tasks
          </span>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['urgent', 'high', 'medium', 'low'].map(priority => {
              const count = member.task_counts[priority];
              if (count === 0) return null;
              const colors = priorityColors[priority];
              return (
                <span key={priority} style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: colors.color,
                  background: colors.bg,
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--border-radius-full)',
                  textTransform: 'capitalize',
                }}>
                  {priority} {count}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
