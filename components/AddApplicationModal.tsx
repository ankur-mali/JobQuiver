'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface FormData {
  company: string;
  position: string;
}

export default function AddApplicationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: session?.user?.id }),
      });
      if (!res.ok) throw new Error('Failed to add application');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application added!');
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add application');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        {/* Backdrop manually */}
        <div className="fixed inset-0 bg-black/30" />
        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Add New Application</h2>
          <form
            onSubmit={handleSubmit(data => {
              setIsSubmitting(true);
              mutate(data);
            })}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                {...register('company', { required: 'Company is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.company && (
                <p className="text-red-500 text-sm">{errors.company.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                {...register('position', { required: 'Position is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.position && (
                <p className="text-red-500 text-sm">{errors.position.message}</p>
              )}
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
