'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface Application {
  id: string;
  status: string;
}

interface ChartData {
  status: string;
  count: number;
}

export default function StatsOverview() {
  const { data: session } = useSession();

  const { data: applications = [], isLoading, error } = useQuery<Application[]>({
    queryKey: ['applications', session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications?userId=${session?.user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const statusCounts = applications.reduce((acc: Record<string, number>, app: Application) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const data: ChartData[] = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count: count as number,
  }));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!data.length) return <div>No application data available</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Application Statistics</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}