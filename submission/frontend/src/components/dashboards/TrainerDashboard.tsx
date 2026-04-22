'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Plus, Users, Link as LinkIcon, Eye } from 'lucide-react';

export default function TrainerDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', date: '', startTime: '', endTime: '', batchId: '' });

  const loadData = async () => {
    try {
      const b = await fetchWithAuth('/batches/my', getToken);
      setBatches(b);
      const s = await fetchWithAuth('/sessions/active', getToken);
      setSessions(s);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/sessions', getToken, {
        method: 'POST',
        body: JSON.stringify(sessionForm),
      });
      alert('Session created!');
      setShowCreate(false);
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  const copyInvite = async (batchId: string) => {
    try {
      const { inviteCode } = await fetchWithAuth(`/batches/${batchId}/invite`, getToken, { method: 'POST' });
      const link = `${window.location.origin}/join?code=${inviteCode}`;
      navigator.clipboard.writeText(inviteCode); // Copying code is easier for this prototype
      alert(`Invite Code ${inviteCode} copied to clipboard! Students can use this to join.`);
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Trainer Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={18} /> {showCreate ? 'Close' : 'Create Session'}
        </button>
      </div>

      {showCreate && (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h3>New Session</h3>
          <form onSubmit={handleCreateSession} style={{ marginTop: '1rem' }}>
             <select onChange={e => setSessionForm({...sessionForm, batchId: e.target.value})} required>
                <option value="">Select Batch</option>
                {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
             <input placeholder="Session Title" onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
             <div style={{ display: 'flex', gap: '1rem' }}>
               <input type="date" onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required />
               <input type="time" placeholder="Start" onChange={e => setSessionForm({...sessionForm, startTime: e.target.value})} required />
               <input type="time" placeholder="End" onChange={e => setSessionForm({...sessionForm, endTime: e.target.value})} required />
             </div>
             <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create</button>
          </form>
        </div>
      )}

      <h2 style={{ marginTop: '3rem' }}>Your Batches</h2>
      <div className="grid">
        {batches.map((batch: any) => (
          <div key={batch.id} className="glass-card">
            <h3>{batch.name}</h3>
            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => copyInvite(batch.id)}>
              <LinkIcon size={16} /> Get Invite Code
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '3rem' }}>Recent Sessions & Attendance</h2>
      <div className="grid">
        {sessions.map((session: any) => (
          <div key={session.id} className="glass-card">
            <h3>{session.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{new Date(session.date).toLocaleDateString()} | {session.startTime}</p>
            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => alert('Detailed view coming soon - check summaries for now.')}>
              <Eye size={16} /> View Attendance
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
