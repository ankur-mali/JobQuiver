'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ApplicationCard({ application }: { application: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{application.company}</h3>
          <p className="text-sm text-gray-500">{application.position}</p>
          <div className="mt-2 text-xs text-gray-400">
            {new Date(application.date).toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-400 hover:text-gray-600"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="mt-2 space-y-1">
          <button className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100">
            Edit
          </button>
          <button className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
