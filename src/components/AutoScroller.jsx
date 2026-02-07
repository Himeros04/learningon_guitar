import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

const AutoScroller = ({ durationSeconds, targetRef, onScrollingStateChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef(null);
    const isPlayingRef = useRef(false); // Use ref for animation loop check

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

    useEffect(() => {
        return () => stopScroll();
    }, []);

    const startScroll = () => {
        if (!targetRef.current) return;

        const element = targetRef.current;
        const totalHeight = element.scrollHeight - element.clientHeight;

        if (totalHeight <= 0) return;

        // If at bottom, reset to top
        if (element.scrollTop >= totalHeight - 5) {
            element.scrollTop = 0;
        }

        // Set playing state
        isPlayingRef.current = true;
        setIsPlaying(true);
        if (onScrollingStateChange) onScrollingStateChange(true);

        const pixelsPerSecond = totalHeight / durationSeconds;
        let lastTime = performance.now();

        const scrollStep = (time) => {
            // Use ref instead of state for immediate check
            if (!isPlayingRef.current) return;

            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            // Re-get totalHeight in case content changed
            const currentTotalHeight = element.scrollHeight - element.clientHeight;

            if (element.scrollTop >= currentTotalHeight - 1) {
                stopScroll();
                return;
            }

            element.scrollTop += pixelsPerSecond * deltaTime;
            animationFrameRef.current = requestAnimationFrame(scrollStep);
        };

        animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    const stopScroll = () => {
        isPlayingRef.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
        if (onScrollingStateChange) onScrollingStateChange(false);
    };

    const toggleScroll = () => {
        if (isPlaying) stopScroll();
        else startScroll();
    };

    return (
        <>
            <div className="auto-scroller glass-panel">
                <div className="auto-scroller-info">
                    <span className="auto-scroller-label">AUTO-SCROLL</span>
                    <div className="auto-scroller-track">
                        <div className="auto-scroller-progress" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <button onClick={toggleScroll} className="btn-primary auto-scroller-btn">
                    {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} style={{ marginLeft: '2px' }} />}
                </button>
            </div>

            <style>{`
                .auto-scroller {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 1000;
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

                /* Mobile: raise above bottom nav, show only play button */
                @media (max-width: 768px) {
                    .auto-scroller {
                        bottom: calc(var(--mobile-nav-height, 70px) + 1rem);
                        right: 1rem;
                        padding: 0.5rem;
                        gap: 0;
                        border-radius: 50%;
                    }

                    .auto-scroller-info {
                        display: none;
                    }

                    .auto-scroller-btn {
                        width: 44px;
                        height: 44px;
                    }
                }
            `}</style>
        </>
    );
};

export default AutoScroller;
