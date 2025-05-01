"use client";

import { Song, usePlayer } from "@/providers/PlayerProvider";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface SongCardProps {
  song: Song;
}

const SongCard = ({ song }: SongCardProps) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [isHovering, setIsHovering] = useState(false);
  
  const isCurrentSong = currentSong?.id === song.id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <button 
      className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-all duration-200 cursor-pointer group w-full text-left"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => playSong(song)}
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      <div className="relative mb-4 aspect-square">
        <Image
          src={song.cover?.startsWith("http") ? song.cover : "/placeholder.svg"}
          alt={song.title}
          fill
          className="object-cover rounded-md"
        />
        <button
          className={`absolute bottom-2 right-2 rounded-full bg-[#1ed760] p-3 shadow-lg opacity-0 translate-y-2 transition-all duration-200 ${
            isHovering || isCurrentSong ? "opacity-100 translate-y-0" : ""
          }`}
          onClick={handlePlayClick}
          aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="h-4 w-4 text-black" />
          ) : (
            <Play className="h-4 w-4 text-black ml-0.5" />
          )}
        </button>
      </div>
      <h3 className="text-white font-medium text-sm truncate">{song.title}</h3>
      <p className="text-gray-400 text-xs mt-1 truncate">{song.artist}</p>
    </button>
  );
};

export default SongCard;
