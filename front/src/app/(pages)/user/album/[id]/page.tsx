"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbumById, fetchAlbumSongs } from "@/api/albumDetails";
import { BiMusic, BiArrowBack, BiPause, BiPlay } from "react-icons/bi";
import { MdMusicNote } from "react-icons/md";
import { usePlayer } from "@/providers/PlayerProvider";

export default function AlbumPage() {
    const params = useParams();
    const albumId = params.id as string;
    const router = useRouter();

    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

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

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["albumDetails", albumId],
        queryFn: () => fetchAlbumById(albumId),
        enabled: !!albumId && isAuthenticated && authCheckComplete,
    });

    const {
        data: songsData,
        isLoading: songsDataIsLoading,
        isError: songsDataIsError,
        error: songsDataError,
    } = useQuery({
        queryKey: ["albumSongs", albumId],
        queryFn: () => fetchAlbumSongs(albumId),
        enabled: !!albumId && isAuthenticated && authCheckComplete,
    });

    useEffect(() => {
        if (songsDataIsError) {
            console.error("Error fetching songs:", songsDataError);
        }
    }, [songsDataIsError, songsDataError]);

    if (!authCheckComplete) {
        return null;
    }

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading || songsDataIsLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-pulse text-[#1ed760] text-xl">Loading album details...</div>
            </div>
        );
    }

    if (isError || songsDataIsError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <div className="text-red-500 text-xl mb-4">
                    {typeof error === "string" ? error : "Error loading album details. Please try again later."}
                </div>
                <button onClick={() => router.push("/")} className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full hover:bg-[#1fdf64]">
                    Back to Homepage
                </button>
            </div>
        );
    }

    const { album } = data || { album: null };
    const songs = songsData?.songs || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e1e1e] to-[#121212] text-white pt-16">
            <div className="container mx-auto px-4 py-6">
                <button onClick={() => router.push("/user/home")} className="flex items-center gap-2 text-white hover:text-[#1ed760] mb-6">
                    <BiArrowBack className="text-xl" />
                    <span>Back</span>
                </button>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative w-full md:w-64 h-64 bg-[#282828] rounded-md overflow-hidden shadow-lg">
                        {album?.albumPic ? (
                            <img src={album.albumPic} alt={album.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#333]">
                                <BiMusic className="text-6xl text-[#b3b3b3]" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-4">{album?.name || "Unknown Album"}</h1>
                        <p className="text-[#b3b3b3] mb-6">By {album?.artist || "Unknown Artist"}</p>
                        <p className="text-[#b3b3b3]">Created on {album?.createdAt ? new Date(album.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Songs</h2>
                    {songs.length > 0 ? (
                        songs.map((song) => (
                            <div
                                key={song.id}
                                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 hover:bg-white/10 transition-colors items-center"
                            >
                                <div className="w-10 text-center flex justify-center">
                                    {currentSong?.id === song.id && isPlaying ? (
                                        <button onClick={togglePlay} className="text-[#1ed760]" aria-label="Pause">
                                            <BiPause className="text-xl" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => playSong({ ...song, album: album.name, album_id: album.id })}
                                            className="text-white opacity-70 hover:opacity-100"
                                            aria-label="Play"
                                        >
                                            <BiPlay className="text-xl" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#333] flex items-center justify-center rounded">
                                        {song.cover ? (
                                            <img src={song.cover} alt={song.title} className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <MdMusicNote className="text-3xl text-[#b3b3b3]" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{song.title}</p>
                                    </div>
                                </div>
                                <div className="text-[#b3b3b3]">{song.category || "-"}</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-[#b3b3b3]">No songs available for this album.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
