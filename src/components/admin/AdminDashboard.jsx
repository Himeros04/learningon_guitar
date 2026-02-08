import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../firebase/users';
import { getAllSongsAdmin } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, Music, Calendar, Mail, Trophy, ChevronDown, ChevronUp, Search } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersData, songsData] = await Promise.all([
                    getAllUsers(),
                    getAllSongsAdmin()
                ]);
                setUsers(usersData);
                setSongs(songsData);
            } catch (error) {
                console.error("Admin fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Format helper for dates
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Handle Firestore Timestamp
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        // Handle ISO string or Date object
        return new Date(timestamp).toLocaleDateString();
    };

    // Filter users
    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.uid?.includes(searchTerm)
    );

    if (!user) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>
            <h2>Accès Refusé</h2>
            <p className="text-muted">Veuillez vous connecter pour accéder au tableau de bord administrateur.</p>
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader className="animate-spin" size={32} />
        </div>
    );

    return (
        <div className="admin-container" style={{ padding: '2rem', color: 'var(--text-main)' }}>
            <div className="admin-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin Dashboard 🎸</h1>
                <p className="text-muted">Vue d'ensemble des utilisateurs et données Fireflies</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Utilisateurs</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</div>
                </div>
                <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Partitions</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{songs.length}</div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur (email, ID)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Users Table */}
            <div className="users-table glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="table-header" style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 50px',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontWeight: 'bold',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                }}>
                    <div>Utilisateur</div>
                    <div>Création</div>
                    <div>Partitions</div>
                    <div>Niveau (XP)</div>
                    <div></div>
                </div>

                <div className="table-body">
                    {filteredUsers.map(u => {
                        const userSongs = songs.filter(s => s.userId === u.uid);
                        const isExpanded = expandedUser === u.uid;

                        return (
                            <div key={u.uid} className="user-row-container" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <div
                                    className="user-row"
                                    onClick={() => setExpandedUser(isExpanded ? null : u.uid)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 50px',
                                        padding: '1rem',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        background: isExpanded ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: 'var(--accent-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}>
                                            {u.email?.[0].toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{u.email || 'Anonyme'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.uid.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <Calendar size={14} />
                                        {formatDate(u.createdAt)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Music size={14} color="var(--accent-primary)" />
                                        <span style={{ fontWeight: 'bold' }}>{userSongs.length}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Trophy size={14} color="#facc15" />
                                        <span>Lvl {u.gamification?.level || 1} <span className="text-muted" style={{ fontSize: '0.8rem' }}>({u.gamification?.xp || 0} XP)</span></span>
                                    </div>
                                    <div>
                                        {isExpanded ? <ChevronUp size={16} /> : <div style={{ transform: 'rotate(0deg)' }}><ChevronDown size={16} /></div>}
                                    </div>
                                </div>

                                {/* Expanded Content: Song List */}
                                {isExpanded && (
                                    <div className="user-details" style={{ padding: '1rem 1rem 1rem 4rem', background: 'rgba(0,0,0,0.2)' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Music size={16} /> Partitions créées ({userSongs.length})
                                        </h3>

                                        {userSongs.length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                {userSongs.map(song => (
                                                    <div key={song.id} style={{
                                                        padding: '0.75rem',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border-subtle)',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {song.title || 'Sans titre'}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {song.artist || 'Artiste inconnu'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                Aucune partition créée pour le moment.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
