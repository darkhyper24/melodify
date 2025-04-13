"use client";

import { useRef, useEffect } from "react";
import { usePlayer } from "@/providers/PlayerProvider";

// Add custom CSS to hide scrollbar for WebKit browsers (Chrome, Safari, newer Edge)
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export function LyricsView() {
    const { currentSong, currentLyricIndex, jumpToLyric, formatTime } = usePlayer();

    const lyricsContainerRef = useRef<HTMLDivElement>(null);
    const lyricRefs = useRef<(HTMLParagraphElement | null)[]>([]);

    // Scroll to active lyric
    useEffect(() => {
        if (currentLyricIndex >= 0 && lyricsContainerRef.current && lyricRefs.current[currentLyricIndex] && currentSong) {
            const container = lyricsContainerRef.current;
            const activeElement = lyricRefs.current[currentLyricIndex];

            if (activeElement) {
                // Calculate the scroll position to center the active lyric
                const containerHeight = container.clientHeight;
                const elementTop = activeElement.offsetTop;
                const elementHeight = activeElement.clientHeight;

                const scrollPosition = elementTop - containerHeight / 2 + elementHeight / 2;

                container.scrollTo({
                    top: scrollPosition,
                    behavior: "smooth",
                });
            }
        }
    }, [currentLyricIndex, currentSong]);

    // Initialize lyric refs array
    useEffect(() => {
        if (currentSong) {
            lyricRefs.current = lyricRefs.current.slice(0, currentSong.lyrics.length);
        }
    }, [currentSong]);

    if (!currentSong) return null;

    return (
        <>
            <style jsx global>
                {scrollbarHideStyles}
            </style>

            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Lyrics</h2>
                </div>
                <div className="flex h-full py-6 rounded-lg bg-zinc-900">
                    <div
                        ref={lyricsContainerRef}
                        className="bg-zinc-900 flex-1 px-6 overflow-y-auto scrollbar-hide"
                        style={{
                            scrollbarWidth: "none" /* Firefox */,
                            msOverflowStyle: "none" /* IE and Edge */,
                        }}
                    >
                        <div className="space-y-4 text-lg">
                            {currentSong.lyrics.map((lyric, index) => (
                                <p
                                    key={index}
                                    ref={(el) => {
                                        lyricRefs.current[index] = el;
                                    }}
                                    onClick={() => lyric.text && jumpToLyric(index)}
                                    className={`transition-all duration-300 ${lyric.text ? "" : "h-4"} ${
                                        currentLyricIndex === index ? "text-white font-bold scale-[101%] transform" : "text-gray-400"
                                    } ${lyric.text ? "cursor-pointer hover:text-gray-200" : ""}`}
                                >
                                    {lyric.text && (
                                        <span className="flex items-center">
                                            <span className="flex-grow">{lyric.text}</span>
                                            <span className="text-xs text-gray-500 ml-2">{formatTime(lyric.time)}</span>
                                        </span>
                                    )}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
