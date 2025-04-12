'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadSong } from '@/api/albumDetails';
import { BiUpload, BiX, BiImage } from 'react-icons/bi';
import Image from 'next/image';

interface UploadSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId?: string;
}

export default function UploadSongModal({ isOpen, onClose, albumId }: UploadSongModalProps) {
  const [songTitle, setSongTitle] = useState('');
  const [songCategory, setSongCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadSongMutation = useMutation({
    mutationFn: ({ title, category, file, cover }: { title: string; category: string; file: File; cover: File | null }) => {
      // Call the API with the albumId parameter and cover file
      return uploadSong(title, category, file, cover, albumId);
    },
    onSuccess: () => {
      // Invalidate album songs query to refresh the list
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['albumSongs', albumId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['albumSongs'] });
      }
      setSongTitle('');
      setSongCategory('');
      setSelectedFile(null);
      setSelectedCover(null);
      setCoverPreview(null);
      setError('');
      onClose();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to upload song');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!songTitle.trim()) {
      setError('Song title is required');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select an audio file');
      return;
    }
    
    uploadSongMutation.mutate({ 
      title: songTitle, 
      category: songCategory || 'General',
      file: selectedFile,
      cover: selectedCover
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select a valid audio file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setSelectedCover(file);
      setCoverPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCoverInput = () => {
    coverInputRef.current?.click();
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
        
        <h2 className="text-2xl font-bold mb-6 text-white">Upload New Song</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="songTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Song Title
            </label>
            <input
              type="text"
              id="songTitle"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="w-full p-3 bg-[#3E3E3E] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
              placeholder="Enter song title"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="songCategory" className="block text-sm font-medium text-gray-300 mb-2">
              Category (optional)
            </label>
            <input
              type="text"
              id="songCategory"
              value={songCategory}
              onChange={(e) => setSongCategory(e.target.value)}
              className="w-full p-3 bg-[#3E3E3E] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
              placeholder="e.g., Rock, Pop, Jazz"
            />
          </div>
          
          <div className="mb-4">
            <p className="block text-sm font-medium text-gray-300 mb-2">
              Audio File
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-[#3E3E3E] rounded-md">
                <span className="text-white truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <BiX className="text-xl" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full p-3 bg-[#3E3E3E] text-white rounded-md border-2 border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center gap-2"
              >
                <BiUpload className="text-xl" />
                Select Audio File
              </button>
            )}
          </div>
          
          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image (Optional)
            </p>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/*"
              className="hidden"
            />
            
            {coverPreview ? (
              <div className="flex items-center justify-between p-3 bg-[#3E3E3E] rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white truncate">{selectedCover?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCover(null);
                    setCoverPreview(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <BiX className="text-xl" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerCoverInput}
                className="w-full p-3 bg-[#3E3E3E] text-white rounded-md border-2 border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center gap-2"
              >
                <BiImage className="text-xl" />
                Select Cover Image
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
              disabled={uploadSongMutation.isPending}
              className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full hover:bg-[#1fdf64] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadSongMutation.isPending ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
