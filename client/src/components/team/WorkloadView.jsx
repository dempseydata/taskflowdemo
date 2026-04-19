import { useState, useRef } from 'react';
import { useWorkload } from '../../hooks/useWorkload';
import { api } from '../../utils/api-client';
import WorkloadMemberCard from './WorkloadMemberCard';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const priorityOrder = ['urgent', 'high', 'medium', 'low'];

const priorityColors = {
  urgent: { color: 'var(--color-priority-urgent)', bg: '#fef2f2' },
  high:   { color: 'var(--color-priority-high)',   bg: '#fff7ed' },
  medium: { color: 'var(--color-priority-medium)', bg: '#fffbeb' },
  low:    { color: 'var(--color-priority-low)',     bg: '#f9fafb' },
};

function TaskList({ tasks, loading }) {
  if (loading) return <Spinner />;
  if (!tasks || tasks.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        No open tasks.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {tasks.map(task => (
        <div key={task.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-border-light)',
        }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: priorityColors[task.priority]?.color || 'var(--color-text-muted)',
            background: priorityColors[task.priority]?.bg || '#f9fafb',
            padding: '2px var(--space-2)',
            borderRadius: 'var(--border-radius-full)',
            textTransform: 'capitalize',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            {task.priority}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              {task.title}
            </div>
            {task.project_name && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {task.project_name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 'var(--space-4)',
};

export default function WorkloadView() {
  const { data: members, loading, error, refetch } = useWorkload();
  const [variant, setVariant] = useState('expandable');

  // Shared task cache across all variants
  const taskCache = useRef({});
  const [taskLoadingIds, setTaskLoadingIds] = useState(new Set());

  // Variant A state
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [expandedTasks, setExpandedTasks] = useState({});

  // Variant B state
  const [panelMember, setPanelMember] = useState(null);
  const [panelTasks, setPanelTasks] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  // Variant C state
  const [modalMember, setModalMember] = useState(null);
  const [modalTasks, setModalTasks] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  async function fetchTasks(memberId) {
    if (taskCache.current[memberId]) return taskCache.current[memberId];
    setTaskLoadingIds(prev => new Set([...prev, memberId]));
    const tasks = await api.get(`/team/${memberId}/tasks`);
    taskCache.current[memberId] = tasks;
    setTaskLoadingIds(prev => { const next = new Set(prev); next.delete(memberId); return next; });
    return tasks;
  }

  async function handleExpandClick(member) {
    const next = new Set(expandedIds);
    if (next.has(member.id)) {
      next.delete(member.id);
    } else {
      next.add(member.id);
      if (!expandedTasks[member.id]) {
        const tasks = await fetchTasks(member.id);
        setExpandedTasks(prev => ({ ...prev, [member.id]: tasks }));
      }
    }
    setExpandedIds(next);
  }

  async function handlePanelClick(member) {
    if (panelMember?.id === member.id) { setPanelMember(null); return; }
    setPanelMember(member);
    setPanelLoading(true);
    const tasks = await fetchTasks(member.id);
    setPanelTasks(tasks);
    setPanelLoading(false);
  }

  async function handleModalClick(member) {
    setModalMember(member);
    setModalLoading(true);
    const tasks = await fetchTasks(member.id);
    setModalTasks(tasks);
    setModalLoading(false);
  }

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div style={{
        padding: 'var(--space-6)',
        background: 'var(--color-error-light)',
        border: '1px solid var(--color-error)',
        borderRadius: 'var(--border-radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
          Failed to load workload data. {error}
        </span>
        <Button variant="secondary" size="small" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const variantTabs = (
    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
      <Button variant={variant === 'expandable' ? 'secondary' : 'ghost'} size="small" onClick={() => setVariant('expandable')}>
        Expandable Rows
      </Button>
      <Button variant={variant === 'panel' ? 'secondary' : 'ghost'} size="small" onClick={() => setVariant('panel')}>
        Slide-Out Panel
      </Button>
      <Button variant={variant === 'modal' ? 'secondary' : 'ghost'} size="small" onClick={() => setVariant('modal')}>
        Modal Deep-Dive
      </Button>
    </div>
  );

  // ── Variant A: Expandable Rows ──────────────────────────────────────────────
  if (variant === 'expandable') {
    return (
      <div>
        {variantTabs}
        <div style={gridStyle}>
          {members.map(member => (
            <div key={member.id}>
              <WorkloadMemberCard member={member} onClick={() => handleExpandClick(member)} />
              {expandedIds.has(member.id) && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-lg)',
                  maxHeight: '280px',
                  overflowY: 'auto',
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 'var(--space-3)',
                  }}>
                    {member.name}'s Tasks
                  </div>
                  <TaskList
                    tasks={expandedTasks[member.id]}
                    loading={taskLoadingIds.has(member.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Variant B: Slide-Out Panel ──────────────────────────────────────────────
  if (variant === 'panel') {
    return (
      <div>
        {variantTabs}
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, ...gridStyle }}>
            {members.map(member => (
              <WorkloadMemberCard
                key={member.id}
                member={member}
                onClick={() => handlePanelClick(member)}
                isSelected={panelMember?.id === member.id}
              />
            ))}
          </div>

          {panelMember && (
            <div style={{
              width: '340px',
              flexShrink: 0,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{panelMember.name}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {panelMember.role}
                  </div>
                </div>
                <button
                  onClick={() => setPanelMember(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)',
                    lineHeight: 1, padding: 'var(--space-1)',
                  }}
                >
                  &times;
                </button>
              </div>
              <div style={{ padding: 'var(--space-4)', maxHeight: '500px', overflow: 'auto' }}>
                <TaskList tasks={panelTasks} loading={panelLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Variant C: Modal Deep-Dive ──────────────────────────────────────────────
  return (
    <div>
      {variantTabs}
      <div style={gridStyle}>
        {members.map(member => (
          <WorkloadMemberCard key={member.id} member={member} onClick={() => handleModalClick(member)} />
        ))}
      </div>

      <Modal
        isOpen={!!modalMember}
        onClose={() => setModalMember(null)}
        title={modalMember ? `${modalMember.name} — Tasks` : ''}
      >
        {modalMember && (
          <div>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {priorityOrder.map(p => {
                const count = modalMember.task_counts[p];
                if (!count) return null;
                return (
                  <span key={p} style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: priorityColors[p].color,
                    background: priorityColors[p].bg,
                    padding: '2px var(--space-2)',
                    borderRadius: 'var(--border-radius-full)',
                    textTransform: 'capitalize',
                  }}>
                    {p} {count}
                  </span>
                );
              })}
              {modalMember.task_counts.total === 0 && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No active tasks</span>
              )}
            </div>
            <TaskList tasks={modalTasks} loading={modalLoading} />
          </div>
        )}
      </Modal>
    </div>
  );
}
