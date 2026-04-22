'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await fetchWithAuth('/sessions/active', getToken);
      setSessions(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadSessions(); }, []);

  const handleJoinBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/batches/join', getToken, {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      });
      alert('Successfully joined batch!');
      setInviteCode('');
      loadSessions();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (sessionId: string, status: string) => {
    try {
      await fetchWithAuth('/attendance/mark', getToken, {
        method: 'POST',
        body: JSON.stringify({ sessionId, status }),
      });
      loadSessions();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Student Dashboard</h1>
        <p>Welcome, {user.name}</p>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>Join a New Batch</h3>
        <form onSubmit={handleJoinBatch} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input 
            placeholder="Enter Batch Invite Code" 
            value={inviteCode} 
            onChange={e => setInviteCode(e.target.value)} 
            required 
            style={{ marginBottom: 0 }}
          />
          <button className="btn btn-primary" disabled={loading}>Join</button>
        </form>
      </div>

      <h2 style={{ marginTop: '3rem' }}>Your Sessions</h2>
      <div className="grid">
        {sessions.map((session: any) => (
          <div key={session.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <h3>{session.title}</h3>
               {session.attendance.length > 0 ? (
                 <span className={`status-tag status-${session.attendance[0].status.toLowerCase()}`}>
                   {session.attendance[0].status}
                 </span>
               ) : (
                 <span className="status-tag" style={{ background: '#475569' }}>Not Marked</span>
               )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {new Date(session.date).toLocaleDateString()} | {session.startTime} - {session.endTime}
            </p>
            <p style={{ marginTop: '1rem' }}>Trainer: {session.trainer.name}</p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => markAttendance(session.id, 'PRESENT')}
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                Mark Present
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => markAttendance(session.id, 'LATE')}
                style={{ flex: 1, fontSize: '0.8rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}
              >
                Mark Late
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p>No sessions found. Join a batch to see sessions.</p>}
      </div>
    </div>
  );
}
