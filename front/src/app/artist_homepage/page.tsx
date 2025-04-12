"use client"

import { BiHome, BiLibrary, BiSearch, BiPlus, BiMusic } from 'react-icons/bi';
import { RiPlayFill } from 'react-icons/ri';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchArtistAlbums, ArtistAlbum } from '@/api/artistAlbums';
import { getProfile } from '@/api/profile';
import { useState, useEffect } from 'react';
import AddAlbumModal from '@/components/AddAlbumModal';

const ArtistHomepage = () => {
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
  const [albumData, setAlbumData] = useState<ArtistAlbum[]>([]);
  const [artistName, setArtistName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use useEffect for localStorage operations to avoid hydration errors
  useEffect(() => {
    // This code only runs on the client after hydration is complete
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (!token) {
      router.push('/signup');
    }
  }, [router]);

  // Fetch artist profile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  });

  useEffect(() => {
    if (profileData?.profile) {
      setArtistName(profileData.profile.fullName);
    }
  }, [profileData]);
  
  // Fetch artist albums
  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistAlbums'],
    queryFn: fetchArtistAlbums
  });
  
  useEffect(() => {
    if (data?.albums && data.albums.length > 0) {
      setAlbumData(data.albums);
    }
  }, [data]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex h-screen bg-black text-white pt-16">
      {/* Sidebar */}
      <div className="w-[340px] h-full bg-[#121212] flex flex-col gap-2 p-2">
        <div className="bg-[#242424] rounded-lg p-4">
          <Link href="/artist_homepage" className="flex items-center gap-4 p-3 text-white font-bold">
            <BiHome className="text-2xl" />
            <span>Home</span>
          </Link>
          <Link href="/search" className="flex items-center gap-4 p-3 text-[#b3b3b3] font-bold hover:text-white">
            <BiSearch className="text-2xl" />
            <span>Search</span>
          </Link>
        </div>

        <div className="flex-1 bg-[#242424] rounded-lg p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-[#b3b3b3] font-bold">
              <BiLibrary className="text-2xl" />
              <span>Your Albums</span>
            </div>
            <button 
              onClick={openModal}
              className="bg-none border-none text-[#b3b3b3] text-2xl p-1 opacity-70 hover:opacity-100 hover:text-white"
              aria-label="Add new album"
            >
              <BiPlus />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 px-2">
            {albumData.length === 0 ? (
              <div className="bg-[#242424] rounded-lg p-5">
                <h2 className="text-base mb-2">Create your first album</h2>
                <p className="text-[#b3b3b3] text-sm mb-5">Start sharing your music with the world</p>
                <button 
                  onClick={openModal}
                  className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  Create album
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {albumData.map((album, index) => (
                  <Link 
                    href={`/album/${album.id}`} 
                    key={album.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10"
                  >
                    <div className="w-12 h-12 bg-[#333] flex items-center justify-center rounded overflow-hidden">
                      {album.albumPic ? (
                        <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                      ) : (
                        <BiMusic className="text-2xl text-[#b3b3b3]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{album.name}</p>
                      <p className="text-[#b3b3b3] text-xs">Album • {new Date(album.createdAt).getFullYear()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto p-6">
        <div className="max-w-[1955px] mx-auto">
          {/* Content rendering based on loading/error state */}
          {(() => {
            if (isLoading) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-[#1ed760] text-xl">Loading...</div>
                </div>
              );
            }
            
            if (isError) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-500 text-xl">Error loading content. Please try again later.</div>
                </div>
              );
            }
            
            return (
              <>
                <section className="mb-10">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {artistName}</h1>
                  <p className="text-[#b3b3b3] mb-6">Manage your music and connect with your audience</p>
                  
                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={openModal}
                      className="bg-[#1ed760] text-black font-bold px-6 py-3 rounded-full hover:bg-[#1fdf64] transition-all flex items-center gap-2"
                    >
                      <BiPlus className="text-xl" />
                      Add New Album
                    </button>
                  </div>
                </section>

                {/* Your Albums Section */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold">Your Albums</h2>
                  </div>
                  
                  {albumData.length === 0 ? (
                    <div className="bg-[#181818] p-8 rounded-lg text-center">
                      <h3 className="text-xl mb-4">You haven't created any albums yet</h3>
                      <p className="text-[#b3b3b3] mb-6">Start creating and sharing your music with your fans</p>
                      <button 
                        onClick={openModal}
                        className="bg-[#1ed760] text-black font-bold px-6 py-3 rounded-full hover:bg-[#1fdf64] transition-all"
                      >
                        Create Your First Album
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                      {albumData.map((album, index) => (
                        <div
                          key={album.id}
                          className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left"
                          onMouseEnter={() => setHoveredAlbum(album.id)}
                          onMouseLeave={() => setHoveredAlbum(null)}
                          onClick={() => router.push(`/album/${album.id}`)}
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
                                <span className="text-2xl font-bold text-white/50">{album.name.charAt(0)}</span>
                              </div>
                            )}
                            {hoveredAlbum === album.id && (
                              <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
                                <RiPlayFill className="text-black text-xl" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-base font-bold mb-2 truncate">{album.name}</h3>
                          <p className="text-sm text-[#b3b3b3] truncate">
                            {new Date(album.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      
                      {/* Add Album Card */}
                      <button
                        onClick={openModal}
                        className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 text-left h-full flex flex-col items-center justify-center"
                      >
                        <div className="w-full aspect-square rounded-md mb-4 bg-[#333] flex items-center justify-center">
                          <BiPlus className="text-4xl text-[#b3b3b3]" />
                        </div>
                        <h3 className="text-base font-bold mb-2 text-center">Add New Album</h3>
                      </button>
                    </div>
                  )}
                </section>
                
                {/* Recently Added Section */}
                {/* Commented out as requested
                {albumData.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-2xl font-bold">Recently Added</h2>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                      {albumData.slice(0, 5).map((album, index) => (
                        <div
                          key={`recent-${album.id}`}
                          className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left"
                          onMouseEnter={() => setHoveredAlbum(`recent-${album.id}`)}
                          onMouseLeave={() => setHoveredAlbum(null)}
                          onClick={() => router.push(`/album/${album.id}`)}
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
                                <span className="text-2xl font-bold text-white/50">{album.name.charAt(0)}</span>
                              </div>
                            )}
                            {hoveredAlbum === `recent-${album.id}` && (
                              <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
                                <RiPlayFill className="text-black text-xl" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-base font-bold mb-2 truncate">{album.name}</h3>
                          <p className="text-sm text-[#b3b3b3] truncate">
                            {new Date(album.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                */}
              </>
            );
          })()}
        </div>
      </main>
      
      {/* Add Album Modal */}
      <AddAlbumModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ArtistHomepage;
