import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Toast Notification System
 * 
 * Usage:
 * 1. Wrap your app with <ToastProvider>
 * 2. Use the useToast() hook: const { showToast } = useToast();
 * 3. Call showToast('Message', 'success')
 */

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <>
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onDismiss={() => onDismiss(toast.id)} />
                ))}
            </div>
            <style>{`
                .toast-container {
                    position: fixed;
                    bottom: calc(var(--mobile-nav-height, 70px) + 1rem);
                    right: 1rem;
                    left: 1rem;
                    z-index: var(--z-toast, 150);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    pointer-events: none;
                }

                @media (min-width: 768px) {
                    .toast-container {
                        left: auto;
                        width: 380px;
                        bottom: 1.5rem;
                    }
                }
            `}</style>
        </>
    );
}

function Toast({ message, type, onDismiss }) {
    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const colors = {
        success: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', icon: '#22c55e' },
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: '#ef4444' },
        info: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', icon: '#6366f1' }
    };

    const color = colors[type] || colors.info;

    return (
        <>
            <div className="toast" style={{
                background: color.bg,
                borderColor: color.border
            }}>
                <span className="toast-icon" style={{ color: color.icon }}>
                    {icons[type] || icons.info}
                </span>
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={onDismiss} aria-label="Fermer">
                    <X size={16} />
                </button>
            </div>
            <style>{`
                .toast {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid;
                    backdrop-filter: blur(12px);
                    animation: toast-slide-in 0.3s ease;
                    pointer-events: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                @keyframes toast-slide-in {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .toast-icon {
                    flex-shrink: 0;
                    display: flex;
                }

                .toast-message {
                    flex: 1;
                    font-size: 0.9rem;
                    color: white;
                    line-height: 1.4;
                }

                .toast-close {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    transition: color 0.2s;
                }

                .toast-close:hover {
                    color: white;
                }
            `}</style>
        </>
    );
}

export default Toast;
