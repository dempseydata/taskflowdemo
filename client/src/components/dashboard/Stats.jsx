const statCardStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--space-6)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const iconCircleStyle = (color, bgColor) => ({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  background: bgColor,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-bold)',
  flexShrink: 0,
});

const labelStyle = {
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-secondary)',
  fontWeight: 'var(--font-weight-medium)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const valueStyle = {
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text)',
  lineHeight: 1.1,
};

const contextStyle = {
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-muted)',
  marginTop: 'var(--space-1)',
};

export default function Stats({ tasks, projects }) {
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === 'done').length || 0;
  const inProgress = tasks?.filter((t) => t.status === 'in-progress').length || 0;
  const activeProjects = projects?.filter((p) => p.status === 'active').length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: '≡',
      color: 'var(--color-info)',
      bgColor: 'var(--color-info-light)',
      context: 'across all projects',
    },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      icon: '✓',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      context: `${completionRate}% completion rate`,
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: '↻',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      context: 'currently active',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: '◈',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
      context: 'running now',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
      {stats.map((stat) => (
        <div key={stat.label} style={statCardStyle}>
          <div style={iconCircleStyle(stat.color, stat.bgColor)}>{stat.icon}</div>
          <div>
            <div style={labelStyle}>{stat.label}</div>
            <div style={valueStyle}>{stat.value}</div>
            <div style={contextStyle}>{stat.context}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
