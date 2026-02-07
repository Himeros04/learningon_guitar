import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Custom Confirm Modal - Styled to match app theme
 * Replaces native window.confirm()
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmation',
    message = 'Êtes-vous sûr ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger' // 'danger' | 'warning' | 'info'
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: '#ef4444',
            button: 'linear-gradient(135deg, #ef4444, #dc2626)',
            buttonHover: 'linear-gradient(135deg, #dc2626, #b91c1c)'
        },
        warning: {
            icon: '#f59e0b',
            button: 'linear-gradient(135deg, #f59e0b, #d97706)',
            buttonHover: 'linear-gradient(135deg, #d97706, #b45309)'
        },
        info: {
            icon: '#6366f1',
            button: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            buttonHover: 'linear-gradient(135deg, #4f46e5, #4338ca)'
        }
    };

    const style = variantStyles[variant] || variantStyles.danger;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 36, 0.98), rgba(20, 20, 26, 0.98))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    animation: 'slideUp 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${style.icon}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertTriangle size={22} color={style.icon} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'white'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Message */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem',
                    paddingLeft: '3.25rem'
                }}>
                    {message}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{
                            background: style.button,
                            border: 'none',
                            color: 'white',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'background 0.2s, transform 0.2s',
                            boxShadow: `0 4px 12px ${style.icon}40`
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = style.buttonHover;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = style.button;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
