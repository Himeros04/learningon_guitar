import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Gift, X } from 'lucide-react';
import { useGamification } from '../../contexts/GamificationContext';
import { XP_VALUES } from '../../services/GamificationService';

const DailyLoot = () => {
    const { gamification, addXp, claimDailyLoot } = useGamification();
    const [isOpen, setIsOpen] = useState(false);
    const [reward, setReward] = useState(null);

    const location = useLocation();

    useEffect(() => {
        // Only show loot on Home or Library screens
        const allowedPaths = ['/', '/library'];
        if (!allowedPaths.includes(location.pathname)) return;

        // Check if loot is available and not claimed
        if (gamification && !gamification.dailyLootClaimed) {
            // Small delay to not annoy user immediately on load
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [gamification, location.pathname]);

    const handleClaim = async () => {
        // Simple reward for now
        const xpAmount = 30; // Bonus XP
        const tip = "Astuce : Utilisez le métronome pour travailler votre régularité !";

        setReward({ xp: xpAmount, tip });

        // Add XP (context handles DB update for dailyLootClaimed? No, dailyLootClaimed is separate?)
        // Wait, context daily login logic handles 'dailyLootClaimed' reset, but we need to mark it as claimed NOW.
        // We need a method in context to claim loot.
        // For now, I'll just add XP and let the user know. 
        // Actually, I need to update the DB to say "claimed = true".
        // The service `updateUserGamification` can be used here? 
        // Better to expose a `claimDailyLoot` method in Context.

        // I will use addXp for now, and I realize I forgot `claimDailyLoot` in context.
        // I will implement a local fix or update context.
        // Let's assume I'll update context in a moment.

        await addXp(xpAmount, 'Daily Loot');
        await claimDailyLoot();
    };

    if (!isOpen) return null;

    return (
        <div className="daily-loot-overlay">
            <div className="daily-loot-card glass-panel">
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                    <X size={20} />
                </button>

                <div className="loot-content">
                    <div className="loot-icon">
                        <Gift size={48} color="#fbbf24" />
                    </div>

                    {!reward ? (
                        <>
                            <h2>Récompense Quotidienne !</h2>
                            <p>Vous êtes revenu ! Voici un petit cadeau pour vous encourager.</p>
                            <button className="btn-primary claim-btn" onClick={handleClaim}>
                                Ouvrir le coffre
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>Génial !</h2>
                            <div className="reward-display">
                                <span className="xp-badge">+{reward.xp} XP</span>
                            </div>
                            <p className="tip-text">{reward.tip}</p>
                            <button className="btn-ghost" onClick={() => setIsOpen(false)}>
                                Continuer à jouer
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .daily-loot-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }

                .daily-loot-card {
                    width: 90%;
                    max-width: 400px;
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    position: relative;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                }

                .loot-icon {
                    margin-bottom: 1.5rem;
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }

                h2 {
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }

                p {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }

                .claim-btn {
                    width: 100%;
                    padding: 0.75rem;
                    font-size: 1.1rem;
                }

                .reward-display {
                    margin: 1rem 0;
                }

                .xp-badge {
                    background: var(--accent-primary);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .tip-text {
                    font-style: italic;
                    font-size: 0.9rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default DailyLoot;
