"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BiArrowBack, BiPlay, BiPause, BiTime } from "react-icons/bi";
import { usePlayer } from "@/providers/PlayerProvider";
import { fetchPlaylistSongs } from "@/api/playlist";

export default function PlaylistPage() {
  const params = useParams();
  const playlistId = params.id as string;
  const router = useRouter();

  const { currentSong, isPlaying, playSong, togglePlay, playQueue } = usePlayer();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setAuthCheckComplete(true);

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const {
    data: playlistData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["playlistSongs", playlistId],
    queryFn: () => fetchPlaylistSongs(playlistId),
    enabled: !!playlistId && isAuthenticated && authCheckComplete,
  });

  // Add a utility function to calculate duration
  const calculateDuration = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && !isNaN(audio.duration)) {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            resolve(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          } else {
            resolve('--:--');
          }
        });
        
        audio.addEventListener('error', () => {
          resolve('--:--');
        });
        
        audio.src = url;
        audio.load();
        
        // Set a timeout to resolve if metadata isn't loaded
        setTimeout(() => resolve('--:--'), 3000);
      } catch (error) {
        resolve('--:--');
      }
    });
  };

  // Add a state for song durations
  const [songDurations, setSongDurations] = useState<Record<string, string>>({});

  // Load durations when songs are loaded
  useEffect(() => {
    if (playlistData?.songs) {
      const loadDurations = async () => {
        const durations: Record<string, string> = {};
        
        for (const song of playlistData.songs) {
          if (song.songUrl) {
            durations[song.id] = await calculateDuration(song.songUrl);
          } else {
            durations[song.id] = '--:--';
          }
        }
        
        setSongDurations(durations);
      };
      
      loadDurations();
    }
  }, [playlistData]);

  if (!authCheckComplete) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-pulse text-[#1ed760] text-xl">Loading playlist...</div>
      </div>
    );
  }

  if (isError || !playlistData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="text-red-500 text-xl">Error loading playlist. Please try again later.</div>
      </div>
    );
  }

  const { playlistName, songs } = playlistData;

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      // Normalize all songs in the playlist to match the Song interface
      const normalizedSongs = songs.map(song => ({
        ...song,
        album: song.albumName || 'Unknown',
        album_id: song.album_id || playlistId, // Use playlistId as a fallback if album_id is null
        cover: song.coverImage || song.albumCover || '',
        lyrics: song.lyrics || [],
        artist: song.artist || 'Unknown Artist',
      }));
      
      // Play the entire queue starting with the first song
      playQueue(normalizedSongs, 0);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1e1e1e] to-[#121212] min-h-screen text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#121212]/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <button
            onClick={() => router.back()}
            className="text-[#b3b3b3] hover:text-white mr-4"
          >
            <BiArrowBack className="text-2xl" />
          </button>
          <h1 className="text-xl font-bold">{playlistName}</h1>
        </div>
      </div>

      {/* Playlist Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-60 h-60 bg-[#282828] flex items-center justify-center rounded-md shadow-lg">
            <div className="text-6xl text-[#7f7f7f]">🎵</div>
          </div>
          
          <div className="flex flex-col">
            <span className="uppercase text-sm text-[#b3b3b3] font-bold">Playlist</span>
            <h1 className="text-5xl font-bold my-3">{playlistName}</h1>
            <p className="text-[#b3b3b3]">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
            
            {songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="mt-6 bg-[#1ed760] text-black font-bold rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 transition-all"
              >
                {isPlaying && currentSong?.id === songs[0].id ? (
                  <BiPause className="text-xl" />
                ) : (
                  <BiPlay className="text-xl ml-1" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="container mx-auto px-4 mt-6">
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#b3b3b3] text-lg">This playlist is empty. Add some songs!</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 p-2 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] mb-4">
              <div className="text-center">#</div>
              <div>Title</div>
              <div>Album</div>
              <div className="flex justify-end">
                <BiTime className="text-lg" />
              </div>
            </div>

            {/* Song Rows */}
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              
              return (
                <div
                  key={song.id}
                  className={`grid grid-cols-[16px_4fr_3fr_1fr] gap-4 p-2 rounded-md group hover:bg-[#ffffff1a] ${
                    isCurrentSong ? "text-[#1ed760]" : "text-white"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isCurrentSong && isPlaying ? (
                      <div className="w-4 h-4 relative flex items-center justify-center">
                        <div className="animate-pulse w-2 h-2 bg-[#1ed760] rounded-full"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center group-hover:hidden">
                        {index + 1}
                      </div>
                    )}
                    <button
                      className="hidden group-hover:flex items-center justify-center"
                      onClick={() => {
                        if (isCurrentSong) {
                          togglePlay();
                        } else {
                          // Find the index of this song in the songs array
                          const songIndex = songs.findIndex(s => s.id === song.id);
                          
                          // Normalize all songs in the playlist
                          const normalizedSongs = songs.map(s => ({
                            ...s,
                            album: s.albumName || 'Unknown',
                            album_id: s.album_id || playlistId, // Use playlistId as a fallback if album_id is null
                            cover: s.coverImage || s.albumCover || '',
                            lyrics: s.lyrics || [],
                            artist: s.artist || 'Unknown Artist',
                          }));
                          
                          // Play the queue starting from this song
                          playQueue(normalizedSongs, songIndex);
                        }
                      }}
                    >
                      {isCurrentSong && isPlaying ? <BiPause /> : <BiPlay />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-[#333] rounded overflow-hidden flex-shrink-0">
                      {song.coverImage ? (
                        <img
                          src={song.coverImage}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : song.albumCover ? (
                        <img
                          src={song.albumCover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#333] flex items-center justify-center">
                          <span className="text-[#b3b3b3]">♪</span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-[#b3b3b3] truncate">
                        {song.artist}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-[#b3b3b3] truncate">
                    {song.albumName || "Single"}
                  </div>
                  <div className="flex items-center justify-end text-[#b3b3b3]">
                    {songDurations[song.id] || '--:--'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 