import React from 'react';

const MasteryBar = ({ mastery = 0, size = 'md' }) => {
    // Determine color based on mastery
    let color = '#ef4444'; // Red (Beginner)
    if (mastery >= 30) color = '#f59e0b'; // Orange (Learning)
    if (mastery >= 70) color = '#10b981'; // Green (Mastered)
    if (mastery >= 100) color = '#8b5cf6'; // Purple (Legendary)

    const height = size === 'sm' ? '4px' : '8px';
    const showText = size !== 'sm';

    return (
        <div className="mastery-container">
            {showText && (
                <div className="mastery-header">
                    <span className="mastery-label">Maîtrise</span>
                    <span className="mastery-value" style={{ color }}>{Math.min(100, mastery)}%</span>
                </div>
            )}
            <div className="mastery-track">
                <div
                    className="mastery-fill"
                    style={{
                        width: `${Math.min(100, mastery)}%`,
                        backgroundColor: color,
                        height
                    }}
                ></div>
            </div>

            <style>{`
                .mastery-container {
                    width: 100%;
                }
                
                .mastery-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .mastery-value {
                    font-weight: bold;
                }
                
                .mastery-track {
                    width: 100%;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .mastery-fill {
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default MasteryBar;
