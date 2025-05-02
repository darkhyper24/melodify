import { useEffect, useState } from "react";
import { searchSongs, searchAlbums, searchArtists } from "@/api/search";
import { Song, usePlayer } from "@/providers/PlayerProvider";
import { AlbumSearchResult, ArtistSearchResult } from "@/api/search";
import dynamic from "next/dynamic";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { fetchAlbumSongs } from "@/api/albumDetails";

const SongRow = dynamic(() => import("./SongRow"), {
  ssr: false,
  loading: () => <div className="h-14 bg-[#181818]/20 animate-pulse rounded-md"></div>
});

interface SearchResultsProps {
  query: string;
  showTopResult?: boolean;
}

const SearchResults = ({ query, showTopResult = true }: SearchResultsProps) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumSearchResult[]>([]);
  const [artists, setArtists] = useState<ArtistSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const { playSong, playQueue } = usePlayer();
  const [albumLoading, setAlbumLoading] = useState<string | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    setIsLoading(true);
    try {
      const [songsResults, albumsResults, artistsResults] = await Promise.all([
        searchSongs(searchQuery),
        searchAlbums(searchQuery),
        searchArtists(searchQuery)
      ]);
      
      setSongs(songsResults);
      setAlbums(albumsResults);
      setArtists(artistsResults);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const hasResults = songs.length > 0 || albums.length > 0 || artists.length > 0;
  const displayedSongs = showAllSongs ? songs : songs.slice(0, 4);
  const displayedArtists = showAllArtists ? artists : artists.slice(0, 7);
  const displayedAlbums = showAllAlbums ? albums : albums.slice(0, 7);

  const handlePlayAlbum = async (albumId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAlbumLoading(albumId);
    try {
      const response = await fetchAlbumSongs(albumId);
      if (response.songs && response.songs.length > 0) {
        const playerSongs = response.songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          album_id: albumId,
          cover: song.cover,
          songUrl: song.songUrl,
          lyrics: song.lyrics || []
        }));
        
        playQueue(playerSongs, 0);
      }
    } catch (error) {
      console.error("Error fetching album songs:", error);
    } finally {
      setAlbumLoading(null);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top section with Top Result and Songs */}
          {hasResults && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Top result section */}
              {showTopResult && (
                <div className="w-full lg:w-[500px] flex-shrink-0">
                  <h2 className="text-white text-xl font-bold mb-4">Top result</h2>
                  <div className="bg-transparent hover:bg-[#232323] rounded-md transition-all duration-300 p-6 h-[280px] relative w-full">
                    {/* Show the first result from any category */}
                    {artists.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="mb-3">
                          <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                            {artists[0].avatarUrl ? (
                              <img src={artists[0].avatarUrl} alt={artists[0].fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                <span className="text-3xl font-bold text-white/50">{artists[0].fullName.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-1 line-clamp-1">{artists[0].fullName}</h3>
                          <p className="text-sm text-[#b3b3b3]">Artist</p>
                        </div>
                      </div>
                    ) : albums.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="mb-3">
                          <div className="w-[150px] h-[150px] rounded-md overflow-hidden">
                            {albums[0].albumPic ? (
                              <img src={albums[0].albumPic} alt={albums[0].name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                <span className="text-3xl font-bold text-white/50">{albums[0].name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mb-12">
                          <h3 className="text-2xl font-bold mb-1 line-clamp-1">{albums[0].name}</h3>
                          <p className="text-sm text-[#b3b3b3] line-clamp-1">
                            Album • {albums[0].artist?.fullName || "Unknown Artist"}
                          </p>
                        </div>
                        <Link 
                          href={`/user/album/${albums[0].id}`}
                          className="absolute bottom-5 right-5 bg-[#1ed760] hover:bg-[#1fdf64] text-black rounded-full p-3 font-bold text-sm transition-all duration-200"
                        >
                          <Play className="h-6 w-6 fill-black" />
                        </Link>
                      </div>
                    ) : songs.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="mb-3">
                          <div className="w-[150px] h-[150px] rounded-md overflow-hidden">
                            <img src={songs[0].cover || '/placeholder.svg'} alt={songs[0].title} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="mb-12">
                          <h3 className="text-2xl font-bold mb-1 line-clamp-1">{songs[0].title}</h3>
                          <p className="text-sm text-[#b3b3b3] line-clamp-1">
                            Song • {songs[0].artist}
                          </p>
                        </div>
                        <button 
                          onClick={() => playSong(songs[0])} 
                          className="absolute bottom-5 right-5 bg-[#1ed760] hover:bg-[#1fdf64] text-black rounded-full p-3 font-bold text-sm transition-all duration-200"
                        >
                          <Play className="h-6 w-6 fill-black" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Songs section as a list */}
              {songs.length > 0 && (
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-xl font-bold">Songs</h2>
                    {songs.length > 4 && (
                      <button 
                        onClick={() => setShowAllSongs(!showAllSongs)}
                        className="text-[#b3b3b3] hover:text-white text-sm flex items-center gap-1"
                      >
                        {showAllSongs ? (
                          <>Show less <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>See all <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {/* Header row for songs */}
                    <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 mb-2 text-xs uppercase text-[#b3b3b3] font-medium border-b border-white/10">
                      <div className="flex items-center justify-end">#</div>
                      <div>Title</div>
                      <div>Album</div>
                      <div className="flex justify-end">Duration</div>
                    </div>
                    
                    {/* Song rows */}
                    <div>
                      {displayedSongs.map((song, index) => (
                        <SongRow key={song.id} song={song} index={index} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Artists section - smaller cards in a row */}
          {artists.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">Artists</h2>
                {artists.length > 7 && (
                  <button 
                    onClick={() => setShowAllArtists(!showAllArtists)}
                    className="text-[#b3b3b3] hover:text-white text-sm flex items-center gap-1"
                  >
                    {showAllArtists ? (
                      <>Show less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>See all <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {displayedArtists.map((artist) => (
                  <div key={artist.id} className="w-full max-w-[180px]">
                    <Link 
                      href={`/artist/${artist.id}`}
                      className="bg-transparent p-4 hover:bg-[#232323] rounded-md transition-all duration-300 flex flex-col items-center text-center h-full"
                    >
                      <div className="w-full aspect-square rounded-full overflow-hidden mb-4 max-w-[150px]">
                        {artist.avatarUrl ? (
                          <img src={artist.avatarUrl} alt={artist.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                            <span className="text-3xl font-bold text-white/50">{artist.fullName.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold truncate w-full">{artist.fullName}</h3>
                      <p className="text-xs text-[#b3b3b3] truncate w-full">Artist</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Albums section - smaller cards in a row */}
          {albums.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">Albums</h2>
                {albums.length > 7 && (
                  <button 
                    onClick={() => setShowAllAlbums(!showAllAlbums)}
                    className="text-[#b3b3b3] hover:text-white text-sm flex items-center gap-1"
                  >
                    {showAllAlbums ? (
                      <>Show less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>See all <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {displayedAlbums.map((album) => (
                  <div key={album.id} className="w-full max-w-[180px]">
                    <Link 
                      href={`/user/album/${album.id}`}
                      className="bg-transparent p-4 hover:bg-[#232323] rounded-md transition-all duration-300 flex flex-col h-full group"
                    >
                      <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 max-w-[150px]">
                        {album.albumPic ? (
                          <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                            <span className="text-3xl font-bold text-white/50">{album.name.charAt(0)}</span>
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => handlePlayAlbum(album.id, e)}
                          className="absolute bottom-2 right-2 bg-[#1ed760] hover:bg-[#1fdf64] text-black rounded-full p-2 opacity-0 group-hover:opacity-100 hover:scale-105 transition-all duration-200 shadow-lg"
                          disabled={albumLoading === album.id}
                        >
                          {albumLoading === album.id ? (
                            <div className="h-5 w-5 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
                          ) : (
                            <Play className="h-5 w-5 fill-black" />
                          )}
                        </button>
                      </div>
                      <h3 className="text-sm font-bold truncate">{album.name}</h3>
                      <p className="text-xs text-[#b3b3b3] truncate">
                        {album.artist?.fullName || "Unknown Artist"}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {query && !isLoading && !hasResults && (
            <div className="text-center py-12">
              <p className="text-white text-lg">No results found for "{query}"</p>
              <p className="text-gray-400 mt-2">
                Please check your spelling or try different keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
