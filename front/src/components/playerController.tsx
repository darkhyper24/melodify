"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, MicVocal } from "lucide-react";
import Image from "next/image";
import { usePlayer } from "@/providers/PlayerProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbumSongs, Song } from "@/api/albumDetails";
import { debounce } from "@/lib/utils";
import { likeSong, unlikeSong } from "@/api/songs";

export function PlayerController() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        showLyrics,
        playbackSpeed,
        queue,
        togglePlay,
        playSong,
        playNext,
        playPrevious,
        handleSeek,
        toggleMute,
        handleVolumeChange,
        toggleLyrics,
        formatTime,
        changePlaybackSpeed,
    } = usePlayer();

    const router = useRouter();
    const pathname = usePathname();
    const [redirectingToSongs, setRedirectingToSongs] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);
    const [showPlayerController, setShowPlayerController] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    const { data, error } = useQuery({
        queryKey: ["albumDetails", currentSong?.album_id],
        queryFn: () => fetchAlbumSongs(currentSong?.album_id ?? ""),
        enabled: !!currentSong?.album_id,
    });
    if (error) {
        console.error("Error fetching album details:", error);
    }

    useEffect(() => {
        if (data?.songs) {
            setSongs(data.songs);
        }
    }, [data]);

    // Ensure lyrics are toggled off when navigating away from /songs
    useEffect(() => {
        if (pathname !== "/songs" && showLyrics) {
            toggleLyrics();
        }
    }, [pathname, showLyrics, toggleLyrics]);

    // Toggle lyrics after redirecting to /songs
    useEffect(() => {
        if (redirectingToSongs && pathname === "/songs") {
            toggleLyrics();
            setRedirectingToSongs(false); // Reset the state
        }
    }, [pathname, redirectingToSongs, toggleLyrics]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userRole = localStorage.getItem("userRole");
            setShowPlayerController(userRole === "user");
        }
    }, []);

    // Check if current song is liked
    useEffect(() => {
        const checkIfLiked = async () => {
            if (!currentSong?.id) return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLiked(false);
                    return;
                }

                // Get the Liked Songs playlist
                const response = await fetch(`http://localhost:8787/playlists`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const playlists = await response.json();
                    const likedPlaylist = playlists.data.find((p: any) => p.name === "Liked Songs");
                    
                    if (likedPlaylist) {
                        // Check if the current song is in the Liked Songs playlist
                        const songsResponse = await fetch(`http://localhost:8787/songs/playlist/${likedPlaylist.id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        
                        if (songsResponse.ok) {
                            const songsData = await songsResponse.json();
                            const isSongLiked = songsData.songs.some((song: any) => song.id === currentSong.id);
                            setIsLiked(isSongLiked);
                        }
                    } else {
                        setIsLiked(false);
                    }
                }
            } catch (error) {
                console.error('Error checking if song is liked:', error);
                setIsLiked(false);
            }
        };

        checkIfLiked();
    }, [currentSong?.id]);

    const handleLikeToggle = async () => {
        if (!currentSong?.id || isLiking) return;

        setIsLiking(true);
        try {
            if (isLiked) {
                await unlikeSong(currentSong.id);
                setIsLiked(false);
            } else {
                await likeSong(currentSong.id);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const debouncedSeek = useCallback(
        debounce((newTime: number[]) => {
            handleSeek(newTime);
        }, 50),
        [handleSeek]
    );

    // Don't render if no song is selected
    if (!currentSong) return null;

    if (!showPlayerController) return null; // Don't render if userRole is not "user"

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] p-4 z-50">
            <div className="max-w-[95rem] mx-auto">
                {/* Progress bar */}
                <div className="mb-2">
                    <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={debouncedSeek} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-400 mt-3">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Song info (small) */}
                    <div className="flex items-center gap-3 w-1/4">
                        <div className="relative h-10 w-10 hidden sm:block">
                            <Image
                                src={currentSong.cover?.startsWith("http") ? currentSong.cover : "/placeholder.svg"}
                                alt={`${currentSong.title} by ${currentSong.artist}`}
                                fill
                                className="object-cover rounded-sm"
                            />
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium truncate">{currentSong.title}</p>
                            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Playback controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={playPrevious}>
                            <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button
                            onClick={togglePlay}
                            variant="default"
                            size="icon"
                            className="bg-white text-black hover:bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center"
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>

                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={playNext}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center justify-end gap-2 w-1/4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (pathname !== "/songs") {
                                    setRedirectingToSongs(true);
                                    router.push("/songs");
                                } else {
                                    toggleLyrics();
                                }
                            }}
                            className={`text-gray-400 hover:text-white hidden sm:flex ${
                                currentSong.lyrics?.length === 0 ? "opacity-50 pointer-events-none" : ""
                            }`}
                            disabled={currentSong.lyrics?.length === 0}
                        >
                            <MicVocal className={`h-5 w-5 ${showLyrics ? "text-white" : "text-gray-400"}`} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`text-gray-400 hover:text-white hidden sm:flex ${isLiked ? "text-red-500" : ""}`}
                            onClick={handleLikeToggle}
                            disabled={isLiking}
                        >
                            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleMute}>
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20 h-1" />
                        </div>

                        {/* Playback speed control */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="speed" className="text-gray-400 text-sm hidden sm:block">
                                Speed:
                            </label>
                            <select
                                id="speed"
                                value={playbackSpeed}
                                onChange={(e) => changePlaybackSpeed(Number(e.target.value))}
                                className="bg-[#1f1f1f] text-gray-400 text-sm rounded p-1"
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
