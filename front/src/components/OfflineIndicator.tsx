"use client";

import { useState, useEffect } from 'react';

export const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
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

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-[85px] right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg">
            You are currently offline. Only cached songs will be available.
        </div>
    );
};