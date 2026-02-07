import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Image Viewer Modal - Full screen with zoom
 */
const ImageViewer = ({ imageUrl, isOpen, onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    if (!isOpen || !imageUrl) return null;

    const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 4));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setScale(s => Math.min(s + 0.1, 4));
        } else {
            setScale(s => Math.max(s - 0.1, 0.5));
        }
    };

    const handleMouseDown = (e) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onClick={handleClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Controls */}
            <div
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    zIndex: 10001
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={handleZoomOut}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Zoom -"
                >
                    <ZoomOut size={20} />
                </button>
                <span style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    minWidth: '60px',
                    textAlign: 'center'
                }}>
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Zoom +"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Réinitialiser"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={handleClose}
                    style={{
                        background: 'rgba(239, 68, 68, 0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Fermer"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Image */}
            <img
                src={imageUrl}
                alt="Preview"
                draggable={false}
                onClick={e => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    userSelect: 'none'
                }}
            />

            {/* Instructions */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.85rem',
                textAlign: 'center'
            }}>
                Molette pour zoomer • Glisser pour déplacer • Clic pour fermer
            </div>
        </div>
    );
};

export default ImageViewer;
