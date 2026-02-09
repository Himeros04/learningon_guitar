import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserHistory } from '../../firebase/users';
import { ChevronLeft, Trophy, Calendar, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LevelHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const data = await getUserHistory(user.uid);
                setHistory(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [user]);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="layout-page">
            <div className="page-header">
                <button
                    className="btn-ghost"
                    onClick={() => navigate(-1)}
                    style={{ marginRight: '1rem' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1>Historique des Points</h1>
            </div>

            <div className="history-container glass-panel">
                {loading ? (
                    <div className="loading-state">Chargement...</div>
                ) : history.length === 0 ? (
                    <div className="empty-state">
                        <Trophy size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Aucun historique pour le moment.</p>
                        <p className="text-muted">Gagnez des points en pratiquant !</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((item) => (
                            <div key={item.id} className="history-item">
                                <div className="history-icon">
                                    <Star size={20} color="#fbbf24" fill="#fbbf24" />
                                </div>
                                <div className="history-content">
                                    <div className="history-reason">{item.reason}</div>
                                    <div className="history-date">
                                        <Clock size={12} style={{ marginRight: 4 }} />
                                        {formatDate(item.createdAt?.toDate ? item.createdAt.toDate() : item.date)}
                                    </div>
                                </div>
                                <div className="history-amount">
                                    +{item.amount} XP
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .layout-page {
                    padding: 2rem;
                    height: 100%;
                    overflow-y: auto;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .history-container {
                    border-radius: 16px;
                    padding: 1.5rem;
                    max-width: 800px;
                    margin: 0 auto;
                    min-height: 300px;
                }

                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: var(--text-muted);
                }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                 .history-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: transform 0.2s;
                }

                .history-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateX(4px);
                }

                .history-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(251, 191, 36, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                }

                .history-content {
                    flex: 1;
                }

                .history-reason {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .history-date {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                }

                .history-amount {
                    font-weight: bold;
                    color: #fbbf24;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .layout-page {
                        padding: 1rem;
                        padding-bottom: 80px; 
                    }
                    
                    .history-container {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LevelHistory;
