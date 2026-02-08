import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import ChordDiagram from './ChordDiagram';
import ChordEditorModal from './ChordEditorModal';
import ChordDetailModal from './ChordDetailModal';
import { subscribeChords, seedInitialChords } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ChordLibrary = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editorConfig, setEditorConfig] = useState({ initialName: '', lockedName: false });
    const [selectedChord, setSelectedChord] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [allChords, setAllChords] = useState(null);

    const handleOpenNewChord = () => {
        setEditorConfig({ initialName: '', lockedName: false });
        setShowModal(true);
    };

    const handleAddVariation = (chord) => {
        setEditorConfig({ initialName: chord.name, lockedName: true });
        setShowModal(true);
        setSelectedChord(null);
    };

    // Subscribe to Firebase chords
    useEffect(() => {
        if (!user) {
            setAllChords([]);
            return;
        }

        const unsubscribe = subscribeChords(user.uid, async (chords) => {
            // Seed initial chords if library is empty
            if (chords.length === 0) {
                await seedInitialChords(user.uid);
                // The subscription will fire again with the new chords
            } else {
                setAllChords(chords);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Compute categories from allChords
    const categories = allChords
        ? ['All', ...new Set(allChords.map(c => c.category || 'Uncategorized'))]
        : ['All'];

    if (!allChords) return <div className="p-8 text-muted">Chargement...</div>;

    const filteredChords = allChords.filter(chord => {
        const matchesSearch = chord.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || chord.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="chord-library">
            <header className="library-header">
                <div>
                    <h1>Dictionnaire d'Accords</h1>
                    <p className="text-muted hide-mobile">Gérez vos accords et variantes par style</p>
                </div>
                <button className="btn-primary add-chord-btn" onClick={handleOpenNewChord}>
                    <Plus size={20} /> <span className="hide-mobile">Nouvel Accord</span>
                </button>
            </header>

            {/* Mobile Filter Toggle */}
            <button
                className="filter-toggle show-mobile"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={16} />
                <span>Filtres ({selectedCategory})</span>
                <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
            </button>

            <div className="library-content">
                {/* Sidebar Filters */}
                <div className={`filters-sidebar glass-panel ${showFilters ? 'show-mobile' : ''}`}>
                    <h3><Filter size={16} /> CATÉGORIES</h3>
                    {categories?.map(cat => (
                        <div
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setShowFilters(false); }}
                            className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                        >
                            <span>{cat}</span>
                            {cat !== 'All' && <span className="count">
                                {allChords.filter(c => c.category === cat).length}
                            </span>}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="chords-main">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un accord..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Grid */}
                    <div className="chords-grid">
                        {filteredChords.map(chord => (
                            <div
                                key={chord.id}
                                className="chord-card glass-panel"
                                onClick={() => setSelectedChord(chord)}
                            >
                                <div className="chord-name">{chord.name}</div>
                                <ChordDiagram chordData={chord.data} width={100} height={120} />
                                <div className="chord-tags">
                                    {chord.tags?.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="chord-category">{chord.category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <ChordEditorModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                    initialName={editorConfig.initialName}
                    lockedName={editorConfig.lockedName}
                />
            )}

            {selectedChord && (
                <ChordDetailModal
                    chord={selectedChord}
                    onClose={() => setSelectedChord(null)}
                    onAddVariation={() => handleAddVariation(selectedChord)}
                />
            )}

            <style>{`
                .chord-library {
                    padding: 2rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .library-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .library-header h1 {
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .add-chord-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-toggle {
                    display: none;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }

                .library-content {
                    display: flex;
                    gap: 2rem;
                    flex: 1;
                    overflow: hidden;
                }

                .filters-sidebar {
                    width: 250px;
                    flex-shrink: 0;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    height: fit-content;
                    border-radius: 12px;
                }

                .filters-sidebar h3 {
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .category-item {
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                    background: transparent;
                    color: var(--text-muted);
                    transition: all 0.2s;
                    display: flex;
                    justify-content: space-between;
                }

                .category-item.active {
                    background: var(--accent-primary);
                    color: white;
                    font-weight: bold;
                }

                .category-item .count {
                    opacity: 0.5;
                    font-size: 0.8rem;
                }

                .chords-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .search-bar {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .search-bar svg {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.5;
                }

                .search-bar input {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border-subtle);
                    border-radius: 12px;
                    padding: 1rem 1rem 1rem 3rem;
                    color: white;
                    font-size: 1rem;
                }

                .chords-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 1.5rem;
                    overflow-y: auto;
                    padding-bottom: 2rem;
                }

                .chord-card {
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: 1px solid var(--border-subtle);
                }

                .chord-card:hover {
                    transform: translateY(-4px);
                }

                .chord-name {
                    font-weight: bold;
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                    color: var(--accent-primary);
                }

                .chord-tags {
                    margin-top: 0.5rem;
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .tag {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.1);
                    color: var(--text-muted);
                }

                .chord-category {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    opacity: 0.3;
                    font-size: 0.7rem;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .chord-library {
                        padding: 1rem;
                    }

                    .library-header h1 {
                        font-size: 1.5rem;
                    }

                    .filter-toggle {
                        display: flex;
                    }

                    .library-content {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .filters-sidebar {
                        display: none;
                        width: 100%;
                        margin-bottom: 1rem;
                    }

                    .filters-sidebar.show-mobile {
                        display: flex;
                    }

                    .chords-grid {
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                        gap: 1rem;
                    }

                    .chord-card {
                        padding: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChordLibrary;
