import React, { useEffect, useState } from 'react';

const Home = () => {
    const [audioUrl, setAudioUrl] = useState('');

    useEffect(() => {
        const fetchAudio = async () => {
            try {
                const response = await fetch('http://localhost:8787/music.mp3');
                if (response.ok) {
                    const audioBlob = await response.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioUrl(audioUrl);
                } else {
                     console.error('Failed to fetch audio file');
                }
            } catch (error) {
                console.error('Error fetching audio file:', error);
            }
        };
        fetchAudio();
    }, []);

    return (
        <div>
            <h1>Listen to the best melodies in the world!</h1>
            {audioUrl && (
                <audio controls>
                    <source src={audioUrl} type="audio/mpeg" />
                </audio>
            )}
        </div>
    );
}

export default Home;
