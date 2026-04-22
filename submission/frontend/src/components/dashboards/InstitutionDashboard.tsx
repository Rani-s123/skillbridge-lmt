'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { BarChart3, Users, Layout } from 'lucide-react';

export default function InstitutionDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [batches, setBatches] = useState([]);
  const [summaries, setSummaries] = useState<any>({});

  const loadData = async () => {
    try {
      const b = await fetchWithAuth('/batches/my', getToken);
      setBatches(b);
      
      const sums: any = {};
      for (const batch of b) {
        const s = await fetchWithAuth(`/attendance/batch/${batch.id}/summary`, getToken);
        sums[batch.id] = s;
      }
      setSummaries(sums);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="container">
      <h1>Institution Dashboard</h1>
      <p style={{ color: 'var(--text-muted)' }}>Managing {user.name} Institutional Data</p>

      <div className="grid" style={{ marginTop: '3rem' }}>
        {batches.map((batch: any) => (
          <div key={batch.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3>{batch.name}</h3>
              <Layout size={20} color="var(--primary)" />
            </div>
            
            {summaries[batch.id] ? (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span>Attendance Rate</span>
                   <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{summaries[batch.id].attendanceRate}%</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span><Users size={14} style={{ marginRight: '4px' }} /> {summaries[batch.id].totalStudents} Students</span>
                  <span><BarChart3 size={14} style={{ marginRight: '4px' }} /> {summaries[batch.id].totalSessions} Sessions</span>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '1rem' }}>Loading summary...</p>
            )}
          </div>
        ))}
        {batches.length === 0 && <p>No batches found under your institution.</p>}
      </div>
    </div>
  );
}
