'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAlbum } from '@/api/artistAlbums';

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAlbumModal({ isOpen, onClose }: AddAlbumModalProps) {
  const [albumName, setAlbumName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createAlbumMutation = useMutation({
    mutationFn: (name: string) => createAlbum(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistAlbums'] });
      setAlbumName('');
      setError('');
      onClose();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create album');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!albumName.trim()) {
      setError('Album name is required');
      return;
    }
    
    createAlbumMutation.mutate(albumName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#282828] rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">Create New Album</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="albumName" className="block text-sm font-medium text-gray-300 mb-2">
              Album Name
            </label>
            <input
              type="text"
              id="albumName"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              className="w-full p-3 bg-[#3E3E3E] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
              placeholder="Enter album name"
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-transparent border border-gray-600 rounded-full hover:border-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAlbumMutation.isPending}
              className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full hover:bg-[#1fdf64] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAlbumMutation.isPending ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
