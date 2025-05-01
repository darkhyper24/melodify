import Link from 'next/link';
import { ArtistSearchResult } from '@/api/search';

interface ArtistCardProps {
  artist: ArtistSearchResult;
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  return (
    <Link
      href={`/artist/${artist.id}`}
      className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left w-full block"
    >
      <div className="w-full aspect-square rounded-full mb-4 relative overflow-hidden shadow-lg">
        {artist.avatarUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={artist.avatarUrl} 
              alt={artist.fullName} 
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
            <span className="text-2xl font-bold text-white/50">
              {artist.fullName.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <h3 className="text-base font-bold mb-1 truncate text-center">{artist.fullName}</h3>
      <p className="text-sm text-[#b3b3b3] truncate text-center">Artist</p>
      
      {artist.bio && (
        <p className="text-xs text-[#b3b3b3] mt-2 line-clamp-2">
          {artist.bio}
        </p>
      )}
    </Link>
  );
};

export default ArtistCard;
