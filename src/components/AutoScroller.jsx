import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Plus, Minus } from 'lucide-react';

const AutoScroller = ({ targetRef, onScrollingStateChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(2); // Speed level 1-5, default 2
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef(null);
    const isPlayingRef = useRef(false);
    const speedRef = useRef(speed);

    // Keep speedRef in sync
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // Monitor scroll progress
    useEffect(() => {
        const element = targetRef.current;
        if (!element) return;

        const handleScroll = () => {
            const totalHeight = element.scrollHeight - element.clientHeight;
            if (totalHeight > 0) {
                const currentProgress = (element.scrollTop / totalHeight) * 100;
                setProgress(Math.min(Math.max(currentProgress, 0), 100));
            }
        };

        element.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => element.removeEventListener('scroll', handleScroll);
    }, [targetRef]);

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

            // Speed: pixels per second = speedLevel * 25
            const pixelsPerSecond = speedRef.current * 25;

            const delta = (time - lastTime) / 1000;
            lastTime = time;

            // Prevent huge jumps if tab was inactive
            if (delta < 0.1) {
                el.scrollTop += pixelsPerSecond * delta;
            }

            // Check if reached bottom
            if (el.scrollTop >= currentTotal - 1) {
                stopScroll();
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

    const increaseSpeed = () => setSpeed(s => Math.min(s + 1, 5));
    const decreaseSpeed = () => setSpeed(s => Math.max(s - 1, 1));

    return (
        <>
            <div className="auto-scroller glass-panel">
                {/* Speed Down */}
                <button
                    onClick={decreaseSpeed}
                    className="auto-scroller-speed-btn"
                    aria-label="Réduire la vitesse"
                    disabled={speed <= 1}
                >
                    <Minus size={18} />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={toggleScroll}
                    className="btn-primary auto-scroller-btn"
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                >
                    {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} style={{ marginLeft: '2px' }} />}
                </button>

                {/* Speed Up */}
                <button
                    onClick={increaseSpeed}
                    className="auto-scroller-speed-btn"
                    aria-label="Augmenter la vitesse"
                    disabled={speed >= 5}
                >
                    <Plus size={18} />
                </button>

                {/* Speed indicator (desktop only) */}
                <span className="auto-scroller-speed-label">x{speed}</span>
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
                    width: 36px;
                    height: 36px;
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
                    font-size: 0.85rem;
                    font-weight: bold;
                    color: var(--accent-primary);
                    min-width: 2rem;
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
                        padding: 0.4rem;
                        gap: 0.4rem;
                    }

                    .auto-scroller-btn {
                        width: 40px;
                        height: 40px;
                    }

                    .auto-scroller-speed-btn {
                        width: 32px;
                        height: 32px;
                    }

                    .auto-scroller-speed-label {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
};

export default AutoScroller;
