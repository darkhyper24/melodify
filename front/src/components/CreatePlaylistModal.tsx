import { useState } from 'react';
import { createPlaylist, updatePlaylistName } from '@/api/playlist';
import { useQueryClient } from '@tanstack/react-query';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistToEdit?: {
    id: string;
    name: string;
  };
}

export default function CreatePlaylistModal({ isOpen, onClose, playlistToEdit }: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState(playlistToEdit?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (playlistToEdit) {
        // Update existing playlist
        await updatePlaylistName(playlistToEdit.id, playlistName);
      } else {
        // Create new playlist
        await createPlaylist(playlistName);
      }
      
      // Invalidate the playlists query to refetch
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      
      // Reset form and close modal
      setPlaylistName('');
      onClose();
    } catch (err: any) {
      console.error('Error saving playlist:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div 
        className="bg-[#282828] rounded-md w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {playlistToEdit ? 'Edit playlist' : 'Create playlist'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="playlist-name" className="block text-sm text-[#b3b3b3] mb-2">
              Name
            </label>
            <input
              id="playlist-name"
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full p-3 bg-[#3e3e3e] border border-[#535353] rounded-md text-white focus:outline-none focus:border-white"
              placeholder="New playlist"
              autoFocus
              maxLength={100}
            />
            {error && <p className="mt-2 text-[#f15e6c] text-sm">{error}</p>}
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-full font-bold text-white bg-transparent hover:bg-[#3e3e3e] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-full font-bold bg-[#1ed760] text-black hover:bg-[#1fdf64] hover:scale-105 transition-all disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (playlistToEdit ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 