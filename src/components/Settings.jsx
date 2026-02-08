import React from 'react';
import { db } from '../db/db';
import { Trash2, AlertTriangle, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Settings = () => {
    const { user } = useAuth();

    const handleResetDatabase = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toute la base de données ? \n\nCeci effacera toutes vos chansons, dossiers et accords personnalisés pour remettre les données par défaut.")) {
            try {
                await db.delete();
                alert("Base de données effacée. L'application va redémarrer.");
                window.location.reload();
            } catch (err) {
                console.error("Erreur lors de la suppression :", err);
                alert("Erreur: " + err.message);
            }
        }
    };

    const handleLogout = async () => {
        if (window.confirm("Voulez-vous vous déconnecter ?")) {
            try {
                await signOut(auth);
                window.location.href = '/';
            } catch (err) {
                console.error("Erreur lors de la déconnexion :", err);
                alert("Erreur: " + err.message);
            }
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Paramètres</h1>

            {/* Account Section */}
            <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} /> Compte
                </h2>

                {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ color: 'white', fontWeight: '500' }}>{user.displayName || 'Utilisateur'}</p>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>{user.email}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                color: 'var(--accent-primary)',
                                border: '1px solid var(--accent-primary)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: 'fit-content'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={18} /> Se déconnecter
                        </button>
                    </div>
                ) : (
                    <p className="text-muted">Non connecté</p>
                )}
            </section>

            <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Informations
                </h2>
                <p className="text-muted">Version : V2.3</p>
                <p className="text-muted">Stockage: Firebase (Cloud) + IndexedDB (Local)</p>
            </section>

            <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                    <AlertTriangle size={20} /> Zone de Danger
                </h2>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    Si vous rencontrez des problèmes ou souhaitez repartir à zéro (pour charger les nouvelles données de test par exemple), vous pouvez réinitialiser la base de données locale.
                </p>

                <button
                    onClick={handleResetDatabase}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <Trash2 size={18} /> Réinitialiser la Base de Données
                </button>
            </section>
        </div>
    );
};

export default Settings;
