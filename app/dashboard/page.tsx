'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ApplicationBoard from '@/components/ApplicationBoard';
import StatsOverview from '@/components/StatsOverview';
import AuthButton from '@/components/AuthButton';

export default function Dashboard() {
  const { status } = useSession();

  if (status === 'unauthenticated') redirect('/');
  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      <AuthButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Applications</h1>
        <StatsOverview />
        <ApplicationBoard />
      </div>
    </div>
  );
}
