'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ApplicationCard from './ApplicationCard';
import StatusColumn from './StatusColumn';
import AddApplicationModal from './AddApplicationModal';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  date: Date;
}

const STATUSES: ('applied' | 'interview' | 'offer' | 'rejected')[] = ['applied', 'interview', 'offer', 'rejected'];

export default function ApplicationBoard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: applications = [], isLoading, error } = useQuery<Application[]>({
    queryKey: ['applications', session?.user?.id], // Include userId in query key
    queryFn: async () => {
      const res = await fetch(`/api/applications?userId=${session?.user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const updateApplication = useMutation({
    mutationFn: async (updatedApp: Application) => {
      const res = await fetch(`/api/applications/${updatedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedApp, userId: session?.user?.id }),
      });
      if (!res.ok) throw new Error('Failed to update application');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', session?.user?.id] });
      toast.success('Application updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update application');
    },
  });

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = applications.findIndex(app => app.id === active.id);
    const newIndex = applications.findIndex(app => app.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newApps = arrayMove(applications, oldIndex, newIndex);
    const updatedApp = {
      ...newApps[newIndex],
      status: over.data.current?.status || newApps[newIndex].status,
    } as Application;

    queryClient.setQueryData(['applications', session?.user?.id], newApps);
    updateApplication.mutate(updatedApp);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const q = query(
      collection(db, 'users', session.user.id, 'applications'),
      where('status', 'in', STATUSES)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(),
      })) as Application[];
      queryClient.setQueryData(['applications', session.user.id], apps);
    }, (error) => {
      toast.error('Failed to sync applications');
      console.error(error);
    });

    return () => unsubscribe();
  }, [session?.user?.id, queryClient]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="space-y-8">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        + Add Application
      </button>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUSES.map(status => {
            const filtered = applications.filter(app => app.status === status);
            return (
              <StatusColumn
                key={status}
                status={status}
                openModal={() => setIsModalOpen(true)}
              >
                <SortableContext
                  items={filtered.map(app => app.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filtered.map(app => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </SortableContext>
              </StatusColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeId ? (
            <ApplicationCard
              application={applications.find(app => app.id === activeId)!}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}