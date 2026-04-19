import { useState } from 'react';
import { useTeam } from '../hooks/useTeam';
import MemberList from '../components/team/MemberList';
import WorkloadView from '../components/team/WorkloadView';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

export default function Team() {
  const { data: members, loading } = useTeam();
  const [view, setView] = useState('list');

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p>Your product team members</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="small" onClick={() => setView('list')}>
            List
          </Button>
          <Button variant={view === 'workload' ? 'secondary' : 'ghost'} size="small" onClick={() => setView('workload')}>
            Workload
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <MemberList members={members} />
      ) : (
        <WorkloadView />
      )}
    </div>
  );
}
