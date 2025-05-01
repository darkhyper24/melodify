"use client";

import { Song, usePlayer } from "@/providers/PlayerProvider";
import { Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";

interface SongRowProps {
  song: Song;
  index: number;
}

const SongRow = ({ song, index }: SongRowProps) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [isHovering, setIsHovering] = useState(false);
  const [duration, setDuration] = useState<string>("0:00");
  
  const isCurrentSong = currentSong?.id === song.id;
  
  // Calculate the song duration when component mounts
  useEffect(() => {
    const calculateDuration = () => {
      if (!song.songUrl) {
        setDuration("0:00");
        return;
      }
      
      const audio = new Audio();
      
      const onLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
        cleanup();
      };
      
      const onError = () => {
        setDuration("0:00");
        cleanup();
      };
      
      // Cleanup function to remove event listeners
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('error', onError);
      };
      
      // Add event listeners
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('error', onError);
      
      // Set src and load
      audio.src = song.songUrl;
      audio.load();
      
      // Set a timeout to resolve if metadata isn't loaded
      const timeout = setTimeout(() => {
        cleanup();
      }, 3000);
      
      // Cleanup on component unmount
      return () => {
        clearTimeout(timeout);
        cleanup();
        audio.src = "";
      };
    };
    
    calculateDuration();
  }, [song.songUrl]);
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  // Format duration (assuming it's in seconds)
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md text-[#b3b3b3] text-sm hover:bg-white/10 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handlePlayClick}
    >
      {/* Song number or play button */}
      <div className="flex items-center justify-end">
        {isHovering ? (
          <button 
            onClick={handlePlayClick}
            className="text-white"
            aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className={`${isCurrentSong ? "text-[#1ed760]" : ""}`}>{index + 1}</span>
        )}
      </div>

      {/* Song title and thumbnail */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="h-10 w-10 flex-shrink-0">
          <img 
            src={song.cover?.startsWith("http") ? song.cover : "/placeholder.svg"} 
            alt={song.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className={`truncate font-medium ${isCurrentSong ? "text-[#1ed760]" : "text-white"}`}>
            {song.title}
          </p>
        </div>
      </div>

      {/* Album */}
      <div className="flex items-center">
        <p className="truncate">{song.album}</p>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-end">
        <p>{duration}</p>
      </div>
    </div>
  );
};

export default SongRow; 