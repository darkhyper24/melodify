"use client";

import { BiHome, BiLibrary, BiSearch, BiPlus } from "react-icons/bi";
import { RiPlayFill } from "react-icons/ri";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbums, Album } from "@/api/artists";
import { useState, useEffect } from "react";

const Home = () => {
    const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<Album[]>([]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["albums"],
        queryFn: fetchAlbums,
    });

    useEffect(() => {
        if (data?.albums && data.albums.length > 0) {
            setAlbumData(data.albums);
        } else if (isError || !data) {
            console.log("Using mock data due to API error or empty response");
        }
    }, [data, isError]);

    console.log("API Response:", data);
    return (
        <div className="flex h-full bg-[#121212] text-white ">
            {/* Sidebar */}
            <div className="w-[340px] overflow-y-auto bg-[#121212] flex flex-col gap-2 p-2 mb-12">
                <div className="bg-[#242424] rounded-lg p-4">
                    <Link href="/user/home" className="flex items-center gap-4 p-3 text-[#b3b3b3] font-bold hover:text-white">
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
                            <span>Your Library</span>
                        </div>
                        <button className="bg-none border-none text-[#b3b3b3] text-2xl p-1 opacity-70 hover:opacity-100 hover:text-white">
                            <BiPlus />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 px-2">
                        <div className="bg-[#242424] rounded-lg p-5">
                            <h2 className="text-base mb-2">Create your first playlist</h2>
                            <p className="text-[#b3b3b3] text-sm mb-5">It&apos;s easy, we&apos;ll help you</p>
                            <button className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform">
                                Create playlist
                            </button>
                        </div>

                        <div className="bg-[#242424] rounded-lg p-5">
                            <h2 className="text-base mb-2">Let&apos;s find some podcasts to follow</h2>
                            <p className="text-[#b3b3b3] text-sm mb-5">We&apos;ll keep you updated on new episodes</p>
                            <button className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform">
                                Browse podcasts
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-b bg-[#1e1e1e] overflow-y-auto p-6 m-2 ml-0 mb-14 rounded-lg">
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

                        const albums = albumData;

                        return (
                            <>
                                <section className="mb-10">
                                    <h1 className="text-3xl font-bold mb-6">
                                        {(() => {
                                            const currentHour = new Date().getHours();
                                            if (currentHour < 12) {
                                                return "Good morning";
                                            } else if (currentHour < 18) {
                                                return "Good afternoon";
                                            } else {
                                                return "Good night";
                                            }
                                        })()}
                                    </h1>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
                                        {albums.slice(0, 6).map((album: Album, index: number) => (
                                            <Link
                                                key={index}
                                                href={`/user/album/${album.id}`}
                                                className="bg-white/10 rounded-md flex items-center gap-4 p-4 cursor-pointer hover:bg-white/20 transition-all duration-200"
                                            >
                                                <div className="w-20 h-20 rounded-md overflow-hidden relative">
                                                    {album.albumPic ? (
                                                        <div className="w-full h-full">
                                                            <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-white/50">{album.name.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold">{album.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                {/* Featured Albums Section */}
                                <section className="mb-12">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-2xl font-bold hover:underline cursor-pointer">Featured Albums</h2>
                                        <span className="text-sm text-[#b3b3b3] font-bold hover:underline cursor-pointer">Show all</span>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                                        {albums.map((album: Album, index: number) => (
                                            <button
                                                key={index}
                                                className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left w-full block"
                                                onMouseEnter={() => setHoveredAlbum(index.toString())}
                                                onMouseLeave={() => setHoveredAlbum(null)}
                                                aria-label={`Play ${album.name}`}
                                            >
                                                <div className="w-full aspect-square rounded-md mb-4 relative overflow-hidden shadow-lg">
                                                    {album.albumPic ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-white/50">{album.name.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                    {hoveredAlbum === index.toString() && (
                                                        <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
                                                            <RiPlayFill className="text-black text-xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-bold mb-2 truncate">{album.name}</h3>
                                                <p className="text-sm text-[#b3b3b3] truncate">Album</p>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Recently Added Section */}
                                <section className="mb-12">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-2xl font-bold hover:underline cursor-pointer">Recently Added</h2>
                                        <span className="text-sm text-[#b3b3b3] font-bold hover:underline cursor-pointer">Show all</span>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                                        {albums
                                            .slice()
                                            .reverse()
                                            .slice(0, 5)
                                            .map((album: Album, index: number) => (
                                                <button
                                                    key={`recent-${index}`}
                                                    className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-200 group text-left w-full block"
                                                    onMouseEnter={() => setHoveredAlbum(`recent-${index}`)}
                                                    onMouseLeave={() => setHoveredAlbum(null)}
                                                    aria-label={`Play ${album.name}`}
                                                >
                                                    <div className="w-full aspect-square rounded-md mb-4 relative overflow-hidden shadow-lg">
                                                        {album.albumPic ? (
                                                            <div className="relative w-full h-full">
                                                                <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                                                <span className="text-2xl font-bold text-white/50">{album.name.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                        {hoveredAlbum === `recent-${index}` && (
                                                            <div className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#1fdf64]">
                                                                <RiPlayFill className="text-black text-xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-bold mb-2 truncate">{album.name}</h3>
                                                    <p className="text-sm text-[#b3b3b3] truncate">Album</p>
                                                </button>
                                            ))}
                                    </div>
                                </section>
                            </>
                        );
                    })()}
                </div>
            </main>
        </div>
    );
};

export default Home;
