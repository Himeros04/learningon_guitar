import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Zap, Clock, TrendingUp } from 'lucide-react';
import { useMetronome } from '../../hooks/useMetronome';
import SmartSongRenderer from '../SongRenderer';
import { useGamification } from '../../contexts/GamificationContext';

const FocusTrainer = ({ content, onClose, title, userBpm = 60 }) => {
    const { isPlaying, bpm, setBpm, togglePlay, stop } = useMetronome(userBpm);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTraining, setIsTraining] = useState(true); // Active session
    const [speedTrainerMode, setSpeedTrainerMode] = useState(false);

    // Gamification
    const { addXp } = useGamification();
    const hasAwardedXp = useRef(false);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isTraining) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTraining]);

    // Speed Trainer Logic (Auto-increase BPM every 30s if playing)
    useEffect(() => {
        let speedInterval;
        if (speedTrainerMode && isPlaying) {
            speedInterval = setInterval(() => {
                setBpm(prev => Math.min(prev + 5, 200));
            }, 30000); // +5 BPM every 30s
        }
        return () => clearInterval(speedInterval);
    }, [speedTrainerMode, isPlaying, setBpm]);

    // Award XP after 5 minutes (300 seconds)
    useEffect(() => {
        if (elapsedTime >= 300 && !hasAwardedXp.current) {
            addXp(50, 'Session Focus (5 min)');
            hasAwardedXp.current = true;
        }
    }, [elapsedTime, addXp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="focus-overlay">
            {/* Header / Controls */}
            <div className="focus-header glass-panel">
                <div className="focus-info">
                    <h2>Focus Mode</h2>
                    <span className="text-muted">{title}</span>
                </div>

                <div className="focus-controls">
                    {/* Timer */}
                    <div className="focus-stat">
                        <Clock size={16} className={elapsedTime >= 300 ? 'text-success' : ''} />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>

                    {/* Metronome Controls */}
                    <div className="metronome-controls">
                        <button className={`btn-icon ${isPlaying ? 'active' : ''}`} onClick={togglePlay}>
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <div className="bpm-control">
                            <span className="bpm-display">{bpm} BPM</span>
                            <input
                                type="range"
                                min="40"
                                max="200"
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value))}
                                className="bpm-slider"
                            />
                        </div>
                    </div>

                    {/* Speed Trainer Toggle */}
                    <button
                        className={`btn-ghost ${speedTrainerMode ? 'active-mode' : ''}`}
                        onClick={() => setSpeedTrainerMode(!speedTrainerMode)}
                        title="Augmente le BPM de 5 toutes les 30s"
                    >
                        <TrendingUp size={18} />
                        <span className="hide-mobile">Speed Trainer</span>
                    </button>

                    <button className="btn-ghost" onClick={() => { stop(); onClose(); }}>
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="focus-content">
                <div className="focus-scroll-area">
                    <SmartSongRenderer content={content} fontSize={24} showSmartCapo={true} />
                </div>
            </div>

            <style>{`
                .focus-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 10, 12, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 200;
                    display: flex;
                    flex-direction: column;
                }

                .focus-header {
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .focus-controls {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .metronome-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.05);
                    padding: 0.5rem 1rem;
                    border-radius: 30px;
                }

                .btn-icon {
                    background: var(--accent-primary);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.1s;
                }

                .btn-icon:active {
                    transform: scale(0.95);
                }
                
                .btn-icon.active {
                    background: #ef4444; /* Stop color */
                }

                .bpm-control {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .bpm-display {
                    font-family: monospace;
                    font-size: 1.2rem;
                    font-weight: bold;
                    min-width: 80px;
                }

                .bpm-slider {
                    width: 100px;
                    accent-color: var(--accent-primary);
                }

                .focus-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-family: monospace;
                    font-size: 1.1rem;
                }

                .text-success {
                    color: #22c55e;
                }

                .active-mode {
                    color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .focus-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                }

                .focus-scroll-area {
                    max-width: 800px;
                    width: 100%;
                    overflow-y: auto;
                    padding: 4rem 2rem;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .focus-header {
                        padding: 1rem;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }

                    .focus-info {
                        text-align: center;
                    }

                    .focus-controls {
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 0.8rem;
                    }

                    .bpm-slider {
                        width: 80px;
                    }
                    
                    .metronome-controls {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default FocusTrainer;
