'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAlbumCover } from '@/api/albumDetails';
import { BiUpload, BiX } from 'react-icons/bi';

interface UploadAlbumCoverModalProps {
  albumId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadAlbumCoverModal({ albumId, isOpen, onClose }: UploadAlbumCoverModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => uploadAlbumCover(albumId, file),
    onSuccess: () => {
      // Invalidate queries to refresh the album data
      queryClient.invalidateQueries({ queryKey: ['albumSongs', albumId] });
      queryClient.invalidateQueries({ queryKey: ['artistAlbums'] });
      setSelectedFile(null);
      setPreviewUrl(null);
      setError('');
      onClose();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to upload album cover');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }
    
    uploadCoverMutation.mutate(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#282828] rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <BiX className="text-2xl" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">Upload Album Cover</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="mb-4">
                <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Album cover preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                    aria-label="Remove selected image"
                  >
                    <BiX className="text-xl" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 truncate">{selectedFile?.name}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full aspect-square bg-[#3E3E3E] text-white rounded-md border-2 border-dashed border-gray-600 hover:border-gray-400 flex flex-col items-center justify-center gap-2"
              >
                <BiUpload className="text-3xl" />
                <span>Select Cover Image</span>
                <span className="text-xs text-gray-400">Recommended: 1000x1000px</span>
              </button>
            )}
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
              disabled={uploadCoverMutation.isPending || !selectedFile}
              className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full hover:bg-[#1fdf64] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadCoverMutation.isPending ? 'Uploading...' : 'Upload Cover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
