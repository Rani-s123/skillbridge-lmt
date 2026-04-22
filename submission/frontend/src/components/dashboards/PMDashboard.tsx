'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Shield, Globe, TrendingUp } from 'lucide-react';

export default function PMDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchWithAuth('/attendance/programme/summary', getToken)
      .then(setSummary)
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1>Programme Manager Dashboard</h1>
      <div className="grid">
        <div className="glass-card">
          <Globe size={24} color="var(--primary)" />
          <h2 style={{ marginTop: '1rem' }}>{summary?.overallRate || '0.00'}%</h2>
          <p style={{ color: 'var(--text-muted)' }}>Overall Programme Attendance</p>
        </div>
        <div className="glass-card">
          <TrendingUp size={24} color="var(--success)" />
          <h2 style={{ marginTop: '1rem' }}>{summary?.totalSessions || 0}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Total Sessions Conducted</p>
        </div>
        <div className="glass-card">
          <Shield size={24} color="var(--warning)" />
          <h2 style={{ marginTop: '1rem' }}>{summary?.activeBatches || 0}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Active Batches Region-wide</p>
        </div>
      </div>
    </div>
  );
}
