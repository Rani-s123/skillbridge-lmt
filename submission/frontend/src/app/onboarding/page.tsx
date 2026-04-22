'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

const ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TRAINER', label: 'Trainer' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'PROGRAMME_MANAGER', label: 'Programme Manager' },
  { value: 'MONITORING_OFFICER', label: 'Monitoring Officer' },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [name, setName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return alert('Please select a role');

    setLoading(true);
    try {
      await fetchWithAuth('/users/sync', getToken, {
        method: 'POST',
        body: JSON.stringify({ name, role }),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '100px' }}>
      <div className="glass-card">
        <h1 style={{ textAlign: 'center' }}>Welcome to SkillBridge</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Please complete your profile to continue
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name"
            required
          />

          <label>Your Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role...</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
