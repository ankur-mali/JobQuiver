'use client';

import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatusColumnProps {
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  children?: ReactNode;
  openModal: () => void;
  isActive?: boolean;
}

const statusColors: Record<string, string> = {
  applied: 'border-blue-500',
  interview: 'border-yellow-500',
  offer: 'border-green-500',
  rejected: 'border-red-500',
};

export default function StatusColumn({
  status,
  children,
  openModal,
  isActive = false,
}: StatusColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col gap-3 w-full md:w-[320px]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">{status}</h2>
        <button
          onClick={openModal}
          className="text-muted-foreground hover:text-primary transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-3 bg-muted/40 rounded-xl p-3 min-h-[150px] border-2 transition-all',
          statusColors[status] || 'border-gray-300',
          isActive && 'bg-muted/60 border-dashed'
        )}
      >
        {children || <div className="text-center text-gray-500">No applications</div>}
      </div>
    </div>
  );
}