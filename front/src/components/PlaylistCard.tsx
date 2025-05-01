import Link from 'next/link';
import { RiPlayFill } from "react-icons/ri";
import { PlaylistSearchResult } from '@/api/search';

interface PlaylistCardProps {
  playlist: PlaylistSearchResult;
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  return (
    <Link
      href={`/user/playlist/${playlist.id}`}
      className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left w-full block"
    >
      <div className="w-full aspect-square rounded-md mb-4 relative overflow-hidden shadow-lg">
        {/* For playlists, we'll use a mosaic-style placeholder since they don't have covers */}
        <div className="w-full h-full bg-gradient-to-br from-[#404040] to-[#282828] flex items-center justify-center">
          <span className="text-2xl font-bold text-white/70">
            {playlist.name.charAt(0)}
          </span>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
          <RiPlayFill className="text-black text-xl" />
        </div>
      </div>
      
      <h3 className="text-base font-bold mb-1 truncate">{playlist.name}</h3>
      <p className="text-sm text-[#b3b3b3] truncate mb-1">
        By {playlist.owner?.fullName || "Unknown"}
      </p>
      <p className="text-xs text-[#b3b3b3]">
        {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
      </p>
    </Link>
  );
};

export default PlaylistCard;
