"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAlbumSongs, Song, deleteSong } from "@/api/albumDetails";
import { BiMusic, BiPlus, BiUpload, BiArrowBack, BiPlay, BiPause, BiTrash } from "react-icons/bi";
import { MdMusicNote } from "react-icons/md";
import UploadSongModal from "@/components/UploadSongModal";
import UploadAlbumCoverModal from "@/components/UploadAlbumCoverModal";
import { fetchArtistAlbums } from "@/api/artistAlbums";

export default function AlbumPage() {
    const params = useParams();
    const albumId = params.id as string;
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUploadSongModalOpen, setIsUploadSongModalOpen] = useState(false);
    const [isUploadCoverModalOpen, setIsUploadCoverModalOpen] = useState(false);
    const [currentPlayingSong, setCurrentPlayingSong] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [albumName, setAlbumName] = useState<string>("");
    const [albumCover, setAlbumCover] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Use useEffect for localStorage operations to avoid hydration errors
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);

        if (!token) {
            router.push("/login");
        }
    }, [router]);

    // Fetch album songs
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["albumSongs", albumId],
        queryFn: () => fetchAlbumSongs(albumId),
        enabled: !!albumId && isAuthenticated,
    });

    // Delete song mutation
    const deleteSongMutation = useMutation({
        mutationFn: deleteSong,
        onSuccess: () => {
            // Refetch album songs after successful deletion
            refetch();
            setDeleteError(null);
        },
        onError: (error: any) => {
            setDeleteError(error.response?.data?.error || "Failed to delete song");
        },
    });

    // Fetch album details to get cover image
    const { data: albumsData } = useQuery({
        queryKey: ["artistAlbums"],
        queryFn: fetchArtistAlbums,
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (data?.album) {
            setAlbumName(data.album);
        }
    }, [data]);

    useEffect(() => {
        if (albumsData?.albums) {
            const currentAlbum = albumsData.albums.find((album) => album.id === albumId);
            if (currentAlbum) {
                setAlbumCover(currentAlbum.albumPic);
            }
        }
    }, [albumsData, albumId]);

    // Handle audio playback
    useEffect(() => {
        return () => {
            // Clean up audio when component unmounts
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, [audio]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const playSong = (song: Song) => {
        if (audio) {
            audio.pause();
        }

        if (currentPlayingSong === song.id) {
            setCurrentPlayingSong(null);
            return;
        }

        const newAudio = new Audio(song.songUrl);
        newAudio.play();
        setAudio(newAudio);
        setCurrentPlayingSong(song.id);

        newAudio.addEventListener("ended", () => {
            setCurrentPlayingSong(null);
        });
    };

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-pulse text-[#1ed760] text-xl">Loading album details...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <div className="text-red-500 text-xl mb-4">
                    {typeof error === "string" ? error : "Error loading album details. Please try again later."}
                </div>
                <button
                    onClick={() => router.push("/artist/home")}
                    className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full hover:bg-[#1fdf64]"
                >
                    Back to Homepage
                </button>
            </div>
        );
    }

    const songs = data?.songs || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e1e1e] to-[#121212] text-white pt-16">
            {/* Back button */}
            <div className="container mx-auto px-4 py-6">
                <button onClick={() => router.push("/artist/home")} className="flex items-center gap-2 text-white hover:text-[#1ed760] mb-6">
                    <BiArrowBack className="text-xl" />
                    <span>Back to Artist Homepage</span>
                </button>

                {/* Error message */}
                {deleteError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md mb-6">{deleteError}</div>}

                {/* Album header */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative w-full md:w-64 h-64 bg-[#282828] rounded-md overflow-hidden shadow-lg group">
                        {albumCover ? (
                            <img src={albumCover} alt={albumName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#333]">
                                <BiMusic className="text-6xl text-[#b3b3b3]" />
                            </div>
                        )}
                        <button
                            onClick={() => setIsUploadCoverModalOpen(true)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <BiUpload className="text-3xl" />
                                <span>{albumCover ? "Change Cover" : "Add Cover"}</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-bold uppercase mb-1">Album</p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{albumName}</h1>
                        <div className="text-[#b3b3b3] mb-6">
                            <p>
                                {songs.length} {songs.length === 1 ? "song" : "songs"}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsUploadSongModalOpen(true)}
                                className="bg-[#1ed760] text-black font-bold px-6 py-3 rounded-full hover:bg-[#1fdf64] transition-all flex items-center gap-2"
                            >
                                <BiPlus className="text-xl" />
                                Add New Song
                            </button>
                        </div>
                    </div>
                </div>

                {/* Songs list */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Songs</h2>

                    {songs.length === 0 ? (
                        <div className="bg-[#181818] p-8 rounded-lg text-center">
                            <h3 className="text-xl mb-4">No songs in this album yet</h3>
                            <p className="text-[#b3b3b3] mb-6">Start uploading your music to share with your fans</p>
                            <button
                                onClick={() => setIsUploadSongModalOpen(true)}
                                className="bg-[#1ed760] text-black font-bold px-6 py-3 rounded-full hover:bg-[#1fdf64] transition-all"
                            >
                                Upload Your First Song
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#181818] rounded-lg overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-[#333] text-[#b3b3b3] text-sm">
                                <div className="w-10 text-center">#</div>
                                <div>Title</div>
                                <div>Category</div>
                                <div className="w-10"></div>
                            </div>

                            {/* Songs */}
                            {songs.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 hover:bg-white/10 transition-colors items-center"
                                >
                                    <div className="w-10 text-center flex justify-center">
                                        {currentPlayingSong === song.id ? (
                                            <button onClick={() => playSong(song)} className="text-[#1ed760]" aria-label="Pause">
                                                <BiPause className="text-xl" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => playSong(song)}
                                                className="text-white opacity-70 hover:opacity-100"
                                                aria-label="Play"
                                            >
                                                <BiPlay className="text-xl" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#333] flex items-center justify-center rounded">
                                            <MdMusicNote className="text-[#b3b3b3]" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{song.title}</p>
                                            <p className="text-sm text-[#b3b3b3]">{formatDate(song.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-[#b3b3b3]">{song.category || "-"}</div>
                                    <div className="w-10 flex justify-center">
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
                                                    deleteSongMutation.mutate(song.id);
                                                }
                                            }}
                                            className="text-[#b3b3b3] hover:text-red-500 transition-colors"
                                            aria-label="Delete song"
                                            disabled={deleteSongMutation.isPending}
                                        >
                                            {deleteSongMutation.isPending && deleteSongMutation.variables === song.id ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                <BiTrash className="text-lg" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <UploadSongModal isOpen={isUploadSongModalOpen} onClose={() => setIsUploadSongModalOpen(false)} albumId={albumId} />

            <UploadAlbumCoverModal albumId={albumId} isOpen={isUploadCoverModalOpen} onClose={() => setIsUploadCoverModalOpen(false)} />
        </div>
    );
}
