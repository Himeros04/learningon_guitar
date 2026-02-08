import React, { useRef, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import SmartSongRenderer from './SongRenderer';
import AutoScroller from './AutoScroller';

/**
 * FullscreenReader - P1 Feature: Immersive reading mode
 * 
 * Displays lyrics in fullscreen with:
 * - Large font size for comfortable reading
 * - High contrast (black background, white text)
 * - AutoScroller integration
 * - Transpose controls
 */
const FullscreenReader = ({
    content,
    title,
    artist,
    transpose,
    onTransposeChange,
    duration,
    onClose
}) => {
    const containerRef = useRef(null);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Prevent body scroll when fullscreen is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fullscreen-reader">
            {/* Header with controls */}
            <div className="fullscreen-header">
                <div className="fullscreen-info">
                    <h2 className="fullscreen-title">{title}</h2>
                    <span className="fullscreen-artist">{artist}</span>
                </div>

                <div className="fullscreen-controls">
                    {/* Transpose controls */}
                    <div className="fullscreen-transpose">
                        <button
                            onClick={() => onTransposeChange(transpose - 1)}
                            aria-label="Transposer -1"
                        >
                            <Minus size={18} />
                        </button>
                        <span className={transpose !== 0 ? 'active' : ''}>
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <button
                            onClick={() => onTransposeChange(transpose + 1)}
                            aria-label="Transposer +1"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        className="fullscreen-close"
                        onClick={onClose}
                        aria-label="Quitter le mode plein écran"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Scrollable content area */}
            <div className="fullscreen-content" ref={containerRef}>
                <SmartSongRenderer
                    content={content}
                    fontSize={24}
                    transpose={transpose}
                />
                {/* Extra padding at bottom for scroll */}
                <div style={{ height: '50vh' }} />
            </div>

            {/* AutoScroller positioned for fullscreen */}
            <AutoScroller
                durationSeconds={duration}
                targetRef={containerRef}
            />

            <style>{`
                .fullscreen-reader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #000;
                    z-index: var(--z-modal, 100);
                    display: flex;
                    flex-direction: column;
                }

                .fullscreen-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: rgba(0, 0, 0, 0.9);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    flex-shrink: 0;
                }

                .fullscreen-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .fullscreen-title {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: #fff;
                    margin: 0;
                }

                .fullscreen-artist {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .fullscreen-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .fullscreen-transpose {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .fullscreen-transpose button {
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 0.5rem 0.75rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .fullscreen-transpose button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .fullscreen-transpose span {
                    padding: 0 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    min-width: 2rem;
                    text-align: center;
                }

                .fullscreen-transpose span.active {
                    color: var(--accent-primary, #6366f1);
                    font-weight: bold;
                }

                .fullscreen-close {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    padding: 0.5rem;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .fullscreen-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .fullscreen-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                    color: #fff;
                    scroll-behavior: smooth;
                }

                /* Override chord colors for better contrast in fullscreen */
                .fullscreen-content .chord-group .chord {
                    color: #fbbf24; /* Yellow for high visibility */
                    font-size: 1em;
                }

                .fullscreen-content .chord-group .lyrics {
                    color: #fff;
                }

                .fullscreen-content .song-line {
                    line-height: 2.8;
                    margin-bottom: 2em;
                }

                /* Mobile adjustments */
                @media (max-width: 768px) {
                    .fullscreen-header {
                        padding: 0.75rem 1rem;
                    }

                    .fullscreen-title {
                        font-size: 1rem;
                    }

                    .fullscreen-artist {
                        font-size: 0.8rem;
                    }

                    .fullscreen-content {
                        padding: 1rem;
                    }

                    .fullscreen-transpose button {
                        padding: 0.4rem 0.6rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default FullscreenReader;
