'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Eye, ShieldCheck, Activity } from 'lucide-react';

export default function MonitoringDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchWithAuth('/attendance/programme/summary', getToken)
      .then(setSummary)
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShieldCheck color="var(--success)" />
        <h1>Monitoring Officer Dashboard (Read-Only)</h1>
      </div>
      
      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
           <Activity size={24} color="var(--primary)" />
           <h3>Programme Health</h3>
           <p style={{ fontSize: '2rem', fontWeight: '800', margin: '1rem 0' }}>{summary?.overallRate}%</p>
           <p style={{ color: 'var(--text-muted)' }}>Average attendance rate across all institutions.</p>
        </div>

        <div className="glass-card" style={{ opacity: 0.8 }}>
          <h3>Programme Statistics</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              Total Batches: {summary?.activeBatches}
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              Total Sessions: {summary?.totalSessions}
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'center', borderColor: 'var(--warning)' }}>
        <Eye size={24} color="var(--warning)" />
        <p style={{ marginTop: '1rem', color: 'var(--warning)' }}>
          You have read-only access. Actions like creating sessions or marking attendance are disabled.
        </p>
      </div>
    </div>
  );
}
