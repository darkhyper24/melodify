"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "@/providers/PlayerProvider";
import { LyricsView } from "@/components/lyricsView";

// Add custom CSS to hide scrollbar for WebKit browsers (Chrome, Safari, newer Edge)
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export default function SongPlayer() {
    const { currentSong, showLyrics: contextShowLyrics } = usePlayer();

    // Initialize state for whether a song is playing or not.
    const [hasCurrentSong, setHasCurrentSong] = useState(!!currentSong);

    useEffect(() => {
        setHasCurrentSong(!!currentSong);
    }, [currentSong]);

    if (!hasCurrentSong) {
        return <div className="p-8 text-center">No song is currently playing</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Style tag for custom scrollbar hiding */}
            <style jsx global>
                {scrollbarHideStyles}
            </style>

            {/* Main content - with padding at bottom to account for fixed player */}
            <div className="flex-1 p-4 md:p-8">
                <div className={`flex flex-col ${contextShowLyrics ? "md:flex-row" : ""} gap-8 transition-all duration-300`}>
                    {/* Left side - Album art and info */}
                    <div className={`flex flex-col items-center ${contextShowLyrics ? "md:w-1/2" : "w-full"} gap-6 transition-all duration-300`}>
                        <div className={`relative aspect-square w-full max-w-xl shadow-2xl transition-all duration-300`}>
                            <Image
                                src={currentSong?.cover || "/placeholder.svg"}
                                alt={`${currentSong?.title} by ${currentSong?.artist}`}
                                fill
                                className="object-cover rounded-md"
                                priority
                            />
                        </div>

                        {/* Song info */}
                        <div className={`w-full max-w-xl ${!contextShowLyrics && "text-center"} transition-all duration-300`}>
                            <h1 className="text-2xl font-bold">{currentSong?.title}</h1>
                            <p className="text-gray-400">
                                {currentSong?.artist} • {currentSong?.album}
                            </p>
                        </div>
                    </div>

                    {/* Right side - Lyrics */}
                    {contextShowLyrics && (
                        <div className="md:w-1/2 flex flex-col transition-all duration-300 h-[500px] mb-24">
                            <LyricsView />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
