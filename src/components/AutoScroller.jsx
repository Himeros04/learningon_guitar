import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

// Speed levels with fixed pixels per second
const SPEED_LEVELS = [
    { label: 'Pause', value: 0, pps: 0 },
    { label: '0.5x', value: 0.5, pps: 20 },
    { label: '1x', value: 1, pps: 40 },
    { label: '1.5x', value: 1.5, pps: 60 },
    { label: '2x', value: 2, pps: 80 }
];

const AutoScroller = ({ targetRef, onScrollingStateChange, onComplete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedIndex, setSpeedIndex] = useState(2); // Default to 1x
    const animationFrameRef = useRef(null);
    const isPlayingRef = useRef(false);
    const speedRef = useRef(SPEED_LEVELS[2]);

    // Keep speedRef in sync
    useEffect(() => {
        speedRef.current = SPEED_LEVELS[speedIndex];
    }, [speedIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopScroll();
    }, []);

    const stopScroll = useCallback(() => {
        isPlayingRef.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
        if (onScrollingStateChange) onScrollingStateChange(false);
    }, [onScrollingStateChange]);

    const startScroll = useCallback(() => {
        const element = targetRef.current;
        if (!element) return;

        const totalScrollable = element.scrollHeight - element.clientHeight;
        if (totalScrollable <= 0) return;

        // Reset to top if at the bottom
        if (Math.abs(element.scrollTop - totalScrollable) < 5) {
            element.scrollTop = 0;
        }

        isPlayingRef.current = true;
        setIsPlaying(true);
        if (onScrollingStateChange) onScrollingStateChange(true);

        let lastTime = performance.now();

        const tick = (time) => {
            if (!isPlayingRef.current || !targetRef.current) return;

            const el = targetRef.current;
            const currentTotal = el.scrollHeight - el.clientHeight;

            // Get current speed (pixels per second)
            const pixelsPerSecond = speedRef.current.pps;

            // If speed is 0 (Pause), just keep the animation running but don't scroll
            if (pixelsPerSecond === 0) {
                lastTime = time;
                animationFrameRef.current = requestAnimationFrame(tick);
                return;
            }

            const delta = (time - lastTime) / 1000;
            lastTime = time;

            // Prevent huge jumps if tab was inactive
            if (delta < 0.1) {
                el.scrollTop += pixelsPerSecond * delta;
            }

            // Check if reached bottom
            if (el.scrollTop >= currentTotal - 1) {
                stopScroll();
                if (onComplete) onComplete();
            } else {
                animationFrameRef.current = requestAnimationFrame(tick);
            }
        };

        animationFrameRef.current = requestAnimationFrame(tick);
    }, [stopScroll, onScrollingStateChange, targetRef]);

    const toggleScroll = useCallback(() => {
        if (isPlayingRef.current) {
            stopScroll();
        } else {
            startScroll();
        }
    }, [startScroll, stopScroll]);

    const increaseSpeed = () => setSpeedIndex(i => Math.min(i + 1, SPEED_LEVELS.length - 1));
    const decreaseSpeed = () => setSpeedIndex(i => Math.max(i - 1, 0));

    const currentSpeed = SPEED_LEVELS[speedIndex];

    return (
        <>
            <div className="auto-scroller glass-panel">
                {/* Speed Down */}
                <button
                    onClick={decreaseSpeed}
                    className="auto-scroller-speed-btn"
                    aria-label="Réduire la vitesse"
                    disabled={speedIndex <= 0}
                >
                    <ChevronDown size={18} />
                </button>

                {/* Speed indicator */}
                <span className="auto-scroller-speed-label">{currentSpeed.label}</span>

                {/* Speed Up */}
                <button
                    onClick={increaseSpeed}
                    className="auto-scroller-speed-btn"
                    aria-label="Augmenter la vitesse"
                    disabled={speedIndex >= SPEED_LEVELS.length - 1}
                >
                    <ChevronUp size={18} />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={toggleScroll}
                    className="btn-primary auto-scroller-btn"
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                >
                    {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} style={{ marginLeft: '2px' }} />}
                </button>
            </div>

            <style>{`
                .auto-scroller {
                    position: fixed;
                    bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem);
                    right: 2rem;
                    z-index: var(--z-autoscroller, 60);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 50px;
                    border: 1px solid var(--accent-primary);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }

                .auto-scroller-btn {
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .auto-scroller-speed-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .auto-scroller-speed-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.2);
                }

                .auto-scroller-speed-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .auto-scroller-speed-label {
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: var(--accent-primary);
                    min-width: 3rem;
                    text-align: center;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .auto-scroller {
                        bottom: calc(
                            env(safe-area-inset-bottom, 0px) + 
                            var(--mobile-nav-height, 70px) + 
                            1rem
                        );
                        right: 1rem;
                        padding: 0.4rem 0.6rem;
                        gap: 0.3rem;
                    }

                    .auto-scroller-btn {
                        width: 40px;
                        height: 40px;
                    }

                    .auto-scroller-speed-btn {
                        width: 28px;
                        height: 28px;
                    }

                    .auto-scroller-speed-label {
                        font-size: 0.8rem;
                        min-width: 2.5rem;
                    }
                }
            `}</style>
        </>
    );
};

export default AutoScroller;
