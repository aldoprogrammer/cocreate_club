'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatorDashboard from '../components/creators/Dashboard';
import AudienceDashboard from '../components/audience/Dashboard';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.role) {
      router.push('/login');
    } else {
      setRole(user.role);
    }
  }, [router]);

  if (!role) return <div className="text-center mt-20 text-lg">Loading...</div>;

  return (
    <div>
      <Navbar />
      {role === 'creator' ? <CreatorDashboard /> : <AudienceDashboard />}
    </div>
  );
}
