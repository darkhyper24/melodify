import { useState, useEffect } from 'react';
import { fetchUserPlaylists, Playlist, addSongToPlaylist } from '@/api/playlist';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BiPlus } from 'react-icons/bi';
import CreatePlaylistModal from './CreatePlaylistModal';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export default function AddToPlaylistModal({ isOpen, onClose, songId }: AddToPlaylistModalProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: playlistsData, isLoading, isError } = useQuery({
    queryKey: ['playlists'],
    queryFn: fetchUserPlaylists,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlaylistId(null);
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToPlaylist = async (playlistId: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await addSongToPlaylist(playlistId, songId);
      
      setMessage({
        text: response.message || 'Song added to playlist!',
        type: 'success'
      });
      
      // Invalidate the playlist songs query to refetch if needed
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlistId] });
      
      // Removed auto-close functionality to keep modal open
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.error || 'Failed to add song to playlist',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
        <div 
          className="bg-[#282828] rounded-md w-full max-w-md p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-6">Add to playlist</h2>
          
          {isLoading ? (
            <div className="py-8 text-center text-[#b3b3b3]">Loading playlists...</div>
          ) : isError ? (
            <div className="py-8 text-center text-red-500">Error loading playlists</div>
          ) : !playlistsData?.data || playlistsData.data.length === 0 ? (
            <div className="py-8 text-center text-[#b3b3b3]">
              <p className="mb-4">You don&apos;t have any playlists yet</p>
              <button 
                className="bg-[#1ed760] text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreatePlaylistModalOpen(true);
                }}
              >
                Create playlist
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-[300px] overflow-y-auto mb-4">
                {playlistsData.data.map((playlist: Playlist) => (
                  <div 
                    key={playlist.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-[#3e3e3e] cursor-pointer transition-colors"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#333333] flex items-center justify-center rounded-md">
                        <span className="text-lg text-[#b3b3b3]">♪</span>
                      </div>
                      <span className="font-medium">{playlist.name}</span>
                    </div>
                    <BiPlus className="text-2xl text-[#b3b3b3]" />
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <button
                  className="w-full p-3 bg-[#333] hover:bg-[#444] rounded-md flex items-center justify-center gap-2 text-white font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatePlaylistModalOpen(true);
                  }}
                >
                  <BiPlus className="text-xl" />
                  <span>Create new playlist</span>
                </button>
              </div>
              
              {message && (
                <div 
                  className={`py-2 px-3 rounded-md text-center ${
                    message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full font-bold text-white bg-transparent hover:bg-[#3e3e3e] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => {
          setIsCreatePlaylistModalOpen(false);
          // Refresh playlists after creating
          queryClient.invalidateQueries({ queryKey: ['playlists'] });
        }}
      />
    </>
  );
} 