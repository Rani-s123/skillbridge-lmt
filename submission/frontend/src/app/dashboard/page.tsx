'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import TrainerDashboard from '@/components/dashboards/TrainerDashboard';
import InstitutionDashboard from '@/components/dashboards/InstitutionDashboard';
import PMDashboard from '@/components/dashboards/PMDashboard';
import MonitoringDashboard from '@/components/dashboards/MonitoringDashboard';

export default function DashboardPage() {
  const { getToken, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
      return;
    }

    async function loadProfile() {
      try {
        const profile = await fetchWithAuth('/users/profile', getToken);
        setUserProfile(profile);
      } catch (error) {
        // If profile not found, they might need onboarding
        router.push('/onboarding');
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadProfile();
  }, [isLoaded, userId, getToken, router]);

  if (loading) return <div className="container"><h1>Loading Dashboard...</h1></div>;

  if (!userProfile) return null;

  switch (userProfile.role) {
    case 'STUDENT': return <StudentDashboard user={userProfile} />;
    case 'TRAINER': return <TrainerDashboard user={userProfile} />;
    case 'INSTITUTION': return <InstitutionDashboard user={userProfile} />;
    case 'PROGRAMME_MANAGER': return <PMDashboard user={userProfile} />;
    case 'MONITORING_OFFICER': return <MonitoringDashboard user={userProfile} />;
    default: return <div>Invalid Role</div>;
  }
}
