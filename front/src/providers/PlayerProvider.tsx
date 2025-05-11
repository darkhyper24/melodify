"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

// Define the song type
export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    album_id: string;
    cover: string;
    songUrl: string;
    lyrics: { text: string; time: number }[];
}

// Sample song data
const sampleSong: Song = {
    id: "blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    album_id: "b225aba4-ca56-4ca1-a3ad-86a9abd01e66",
    cover: "https://images.genius.com/34c1c35ca27a735e6e5f18611acb1c16.1000x1000x1.png",
    songUrl: "https://ipficywkrkybhrhnvjxe.supabase.co/storage/v1/object/public/pop-music//blinding-lights.weba",
    lyrics: [
        { text: "I've been tryna call", time: 28 },
        { text: "I've been on my own for long enough", time: 30.5 },
        { text: "Maybe you can show me how to love, maybe", time: 33 },
        { text: "I'm going through withdrawals", time: 38 },
        { text: "You don't even have to do too much", time: 42 },
        { text: "You can turn me on with just a touch, baby", time: 44 },
        { text: "♪", time: 48 },
        { text: "I look around and", time: 50 },
        { text: "Sin City's cold and empty (oh)", time: 51.5 },
        { text: "No one's around to judge me (oh)", time: 54 },
        { text: "I can't see clearly when you're gone", time: 56.5 },
        { text: "♪", time: 60 },
        { text: "I said, ooh, I'm blinded by the lights", time: 61 },
        { text: "No, I can't sleep until I feel your touch", time: 67 },
        { text: "I said, ooh, I'm drowning in the night", time: 72 },
        { text: "Oh, when I'm like this, you're the one I trust", time: 78 },
        { text: "♪", time: 82 },
        { text: "(Hey, hey, hey)", time: 82.5 },
        { text: "♪", time: 84.75 },
        { text: "I'm running out of time", time: 95 },
        { text: "'Cause I can see the sun light up the sky", time: 97 },
        { text: "So I hit the road in overdrive, baby, oh", time: 100 },
        { text: "♪", time: 107 },
        { text: "The city's cold and empty (oh)", time: 107 },
        { text: "No one's around to judge me (oh)", time: 110 },
        { text: "I can't see clearly when you're gone", time: 113 },
        { text: "♪", time: 117 },
        { text: "I said, ooh, I'm blinded by the lights", time: 117 },
        { text: "No, I can't sleep until I feel your touch", time: 123 },
        { text: "I said, ooh, I'm drowning in the night", time: 128 },
        { text: "Oh, when I'm like this, you're the one I trust", time: 134 },
        { text: "♪", time: 138.5 },
        { text: "I'm just walking by to let you know (by to let you know)", time: 140 },
        { text: "I could never say it on the phone (say it on the phone)", time: 143 },
        { text: "Will never let you go this time (ooh)", time: 146 },

        { text: "♪", time: 150 },
        { text: "I said, ooh, I'm blinded by the lights", time: 151 },
        { text: "No, I can't sleep until I feel your touch", time: 157 },
        { text: "♪", time: 161 },
        { text: "(Hey, hey, hey)", time: 161.75 },
        { text: "♪", time: 163.25 },
        { text: "(Hey, hey, hey)", time: 172.75 },
        { text: "♪", time: 174.5 },
        { text: "I said, ooh, I'm blinded by the lights", time: 184.75 },
        { text: "No, I can't sleep until I feel your touch", time: 190.5 },
        { text: "♪", time: 194.85 },
    ],
};

// Define the context type
interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    showLyrics: boolean;
    currentLyricIndex: number;
    queue: Song[];
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playSong: (song: Song) => void;
    playQueue: (songs: Song[], startIndex: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    togglePlay: () => void;
    handleSeek: (newTime: number[]) => void;
    toggleMute: () => void;
    handleVolumeChange: (newVolume: number[]) => void;
    toggleLyrics: () => void;
    formatTime: (time: number) => string;
    jumpToLyric: (index: number) => void;
    playbackSpeed: number;
    changePlaybackSpeed: (speed: number) => void;
}

// Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Provider component
export function PlayerProvider({ children }: { children: React.ReactNode }) {
    // Audio state
    const [currentSong, setCurrentSong] = useState<Song | null>(sampleSong); // Start with sample song
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // Default speed is 1x
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);
    const [isOffline, setIsOffline] = useState(false);

    // References
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Monitor online/offline status
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Format time in MM:SS
    const formatTime = (time: number) => {
        if (time && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
        return "0:00";
    };

    // Play a specific song
    const playSong = useCallback(async (song: Song) => {
        try {
            // Check if song is available in cache when offline
            if (isOffline) {
                const cache = await caches.open('melodify-music-cache-v1');
                const cachedResponse = await cache.match(song.songUrl);
                
                if (!cachedResponse) {
                    throw new Error('Song not available offline');
                }
            }

            setCurrentSong({
                ...song,
                lyrics: Array.isArray(song.lyrics) ? song.lyrics : [],
            });
            // Clear the queue when playing a single song
            setQueue([]);
            setCurrentQueueIndex(-1);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing song:', error);
            // Handle error (show notification to user)
        }
    }, [isOffline]);

    // Play a queue of songs starting at a specific index
    const playQueue = (songs: Song[], startIndex: number) => {
        if (songs.length === 0 || startIndex < 0 || startIndex >= songs.length) {
            return;
        }
        
        const newSong = {
            ...songs[startIndex],
            lyrics: Array.isArray(songs[startIndex].lyrics) ? songs[startIndex].lyrics : [],
        };
        
        setCurrentSong(newSong);
        setQueue(songs);
        setCurrentQueueIndex(startIndex);
        setIsPlaying(true);
    };

    // Play the next song in the queue
    const playNext = () => {
        if (queue.length === 0 || currentQueueIndex === -1) {
            return;
        }
        
        // If at the end of the queue, loop back to the first song
        const nextIndex = currentQueueIndex >= queue.length - 1 ? 0 : currentQueueIndex + 1;
        const nextSong = {
            ...queue[nextIndex],
            lyrics: Array.isArray(queue[nextIndex].lyrics) ? queue[nextIndex].lyrics : [],
        };
        
        setCurrentSong(nextSong);
        setCurrentQueueIndex(nextIndex);
        setIsPlaying(true);
    };

    // Play the previous song in the queue
    const playPrevious = () => {
        if (queue.length === 0 || currentQueueIndex <= 0) {
            // If at the beginning of queue or no queue, restart current song
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
            }
            return;
        }
        
        const prevIndex = currentQueueIndex - 1;
        const prevSong = {
            ...queue[prevIndex],
            lyrics: Array.isArray(queue[prevIndex].lyrics) ? queue[prevIndex].lyrics : [],
        };
        
        setCurrentSong(prevSong);
        setCurrentQueueIndex(prevIndex);
        setIsPlaying(true);
    };

    // Handle play/pause
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch((error) => {
                    console.error("Error playing audio:", error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle volume change
    const handleVolumeChange = (newVolume: number[]) => {
        const volumeValue = newVolume[0];
        setVolume(volumeValue);
        if (audioRef.current) {
            audioRef.current.volume = volumeValue;
            setIsMuted(volumeValue === 0);
        }
    };

    // Handle seeking
    const handleSeek = (newTime: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newTime[0];
            setCurrentTime(newTime[0]);
        }
    };

    // Toggle mute
    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume;
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    // Toggle lyrics visibility
    const toggleLyrics = () => {
        setShowLyrics(!showLyrics);
    };

    // Jump to specific lyric timestamp
    const jumpToLyric = (index: number) => {
        if (audioRef.current && currentSong?.lyrics[index]) {
            const time = currentSong.lyrics[index].time;
            const audio = audioRef.current;

            // Set the current time
            audio.currentTime = time;
            setCurrentTime(time);

            // Start playing if not already playing
            if (!isPlaying) {
                const handleLoadedData = () => {
                    audio
                        .play()
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((error) => {
                            console.error("Error playing audio:", error);
                        });
                    audio.removeEventListener("loadeddata", handleLoadedData);
                };

                // If the audio is already loaded, play immediately
                if (audio.readyState >= 2) {
                    audio
                        .play()
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((error) => {
                            console.error("Error playing audio:", error);
                        });
                } else {
                    // Otherwise, wait for the audio to load
                    audio.addEventListener("loadeddata", handleLoadedData);
                }
            }
        }
    };
    // Update time as audio plays and sync lyrics
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);

            // Ensure lyrics is an array before calling findIndex
            if (!Array.isArray(currentSong.lyrics)) {
                console.warn("Lyrics is not an array or is undefined.");
                return;
            }

            // Find the current lyric based on time
            const currentIndex = currentSong.lyrics.findIndex((lyric, index) => {
                const nextLyric = currentSong.lyrics[index + 1];
                if (nextLyric) {
                    return audio.currentTime >= lyric.time && audio.currentTime < nextLyric.time;
                }
                return audio.currentTime >= lyric.time;
            });

            if (currentIndex !== currentLyricIndex) {
                setCurrentLyricIndex(currentIndex);
            }
        };

        // Events
        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);

        // Cleanup
        return () => {
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
        };
    }, [currentLyricIndex, currentSong]);

    useEffect(() => {
        if (audioRef.current && currentSong) {
            if (audioRef.current.src !== currentSong.songUrl) {
                audioRef.current.src = currentSong.songUrl;
            }
            if (isPlaying) {
                audioRef.current.play().catch((error) => {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                });
            }
        }
    }, [currentSong, isPlaying]);

    // Set initial volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Update playback speed when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
    };

    // Auto-play next song when current song ends
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleSongEnd = () => {
            if (queue.length > 0 && currentQueueIndex >= 0) {
                playNext(); // This will now loop back to the first song when at the end
            }
        };

        audio.addEventListener('ended', handleSongEnd);
        
        return () => {
            audio.removeEventListener('ended', handleSongEnd);
        };
    }, [queue, currentQueueIndex]);

    const value = {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        showLyrics,
        currentLyricIndex,
        queue,
        audioRef,
        playSong,
        playQueue,
        playNext,
        playPrevious,
        togglePlay,
        handleSeek,
        toggleMute,
        handleVolumeChange,
        toggleLyrics,
        formatTime,
        jumpToLyric,
        playbackSpeed,
        changePlaybackSpeed,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {/* Audio element is here so it persists across page navigation */}
            <audio ref={audioRef} />
        </PlayerContext.Provider>
    );
}

// Custom hook to use the player context
export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
