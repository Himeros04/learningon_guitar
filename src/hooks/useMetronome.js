import { useState, useEffect, useRef } from 'react';
import audioEngine from '../utils/AudioEngine';

export const useMetronome = (initialBpm = 60) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(initialBpm);

    useEffect(() => {
        audioEngine.setBpm(bpm);
    }, [bpm]);

    const togglePlay = () => {
        if (isPlaying) {
            audioEngine.stop();
        } else {
            audioEngine.start();
        }
        setIsPlaying(!isPlaying);
    };

    const stop = () => {
        audioEngine.stop();
        setIsPlaying(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            audioEngine.stop();
        };
    }, []);

    return {
        isPlaying,
        bpm,
        setBpm,
        togglePlay,
        stop
    };
};
