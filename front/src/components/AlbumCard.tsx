import Link from 'next/link';
import { RiPlayFill } from "react-icons/ri";
import { AlbumSearchResult } from '@/api/search';

interface AlbumCardProps {
  album: AlbumSearchResult;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  return (
    <Link
      href={`/user/album/${album.id}`}
      className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left w-full block"
    >
      <div className="w-full aspect-square rounded-md mb-4 relative overflow-hidden shadow-lg">
        {album.albumPic ? (
          <div className="relative w-full h-full">
            <img 
              src={album.albumPic} 
              alt={album.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
            <span className="text-2xl font-bold text-white/50">
              {album.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
          <RiPlayFill className="text-black text-xl" />
        </div>
      </div>
      
      <h3 className="text-base font-bold mb-1 truncate">{album.name}</h3>
      <p className="text-sm text-[#b3b3b3] truncate mb-1">
        {album.artist?.fullName || "Unknown Artist"}
      </p>
      <p className="text-xs text-[#b3b3b3]">
        {album.songCount} {album.songCount === 1 ? 'song' : 'songs'}
      </p>
    </Link>
  );
};

export default AlbumCard;
