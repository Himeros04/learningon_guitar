import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

const AutoScroller = ({ durationSeconds, targetRef, onScrollingStateChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef(null);
    const isPlayingRef = useRef(false);

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
        // Initial check
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

        // Only reset to top if we are already at the very bottom
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

            // Calculate speed dynamically (pixels per second)
            // Use currentTotal to handle content resizing
            const speed = currentTotal / (durationSeconds || 180);

            const delta = (time - lastTime) / 1000;
            lastTime = time;

            // Prevent huge jumps if tab was inactive
            if (delta < 0.1) {
                el.scrollTop += speed * delta;
            }

            // Check if reached bottom
            if (el.scrollTop >= currentTotal - 1) {
                stopScroll();
            } else {
                animationFrameRef.current = requestAnimationFrame(tick);
            }
        };

        animationFrameRef.current = requestAnimationFrame(tick);
    }, [durationSeconds, stopScroll, onScrollingStateChange, targetRef]);

    const toggleScroll = useCallback(() => {
        if (isPlayingRef.current) {
            stopScroll();
        } else {
            startScroll();
        }
    }, [startScroll, stopScroll]);

    return (
        <>
            <div className="auto-scroller glass-panel">
                <div className="auto-scroller-info">
                    <span className="auto-scroller-label">AUTO-SCROLL</span>
                    <div className="auto-scroller-track">
                        <div className="auto-scroller-progress" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <button
                    onClick={toggleScroll}
                    className="btn-primary auto-scroller-btn"
                    aria-label={isPlaying ? 'Pause du défilement' : 'Lecture automatique'}
                >
                    {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} style={{ marginLeft: '2px' }} />}
                </button>
            </div>

            <style>{`
                .auto-scroller {
                    position: fixed;
                    /* P0 Fix: Use safe-area-inset and CSS variable for mobile nav */
                    bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem);
                    right: 2rem;
                    /* P0 Fix: Use z-index variable */
                    z-index: var(--z-autoscroller, 60);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 50px;
                    border: 1px solid var(--accent-primary);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }

                .auto-scroller-info {
                    display: flex;
                    flex-direction: column;
                    min-width: 100px;
                }

                .auto-scroller-label {
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: var(--text-muted);
                    margin-bottom: 2px;
                }

                .auto-scroller-track {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .auto-scroller-progress {
                    height: 100%;
                    background: var(--accent-primary);
                }

                .auto-scroller-btn {
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* Mobile: raise above bottom nav with safe area support */
                @media (max-width: 768px) {
                    .auto-scroller {
                        /* P0 Fix: Proper positioning above mobile nav with safe area */
                        bottom: calc(
                            env(safe-area-inset-bottom, 0px) + 
                            var(--mobile-nav-height, 70px) + 
                            1rem
                        );
                        right: 1rem;
                        padding: 0.5rem;
                        gap: 0;
                        border-radius: 50%;
                    }

                    .auto-scroller-info {
                        display: none;
                    }

                    .auto-scroller-btn {
                        width: 48px;
                        height: 48px;
                    }
                }
            `}</style>
        </>
    );
};

export default AutoScroller;
