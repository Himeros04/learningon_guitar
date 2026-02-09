import { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Book, Edit, Settings as SettingsIcon, Music, LogOut, User, Trophy, Flame } from 'lucide-react';
import Library from './components/Library';
import SongEditor from './components/SongEditor';
import ChordLibrary from './components/ChordLibrary';
import Settings from './components/Settings';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { GamificationProvider, useGamification } from './contexts/GamificationContext';
import { getLevelProgress } from './services/GamificationService';
import DailyLoot from './components/gamification/DailyLoot';
import LevelHistory from './components/gamification/LevelHistory';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <GamificationProvider>
            <Router>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </GamificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function MainLayout() {
  return (
    <div className="layout-main">
      <Sidebar />
      <DailyLoot />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<Library />} />
          <Route path="/editor" element={<SongEditor />} />
          <Route path="/editor/:id" element={<SongEditor />} />
          <Route path="/chords" element={<ChordLibrary />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/level-history" element={<LevelHistory />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { gamification } = useGamification();

  const navItems = [
    { label: 'Bibliothèque', path: '/library', icon: <Book size={18} /> },
    { label: 'Nouvelle Partition', path: '/editor', icon: <Edit size={18} /> },
    { label: 'Accords', path: '/chords', icon: <Music size={18} /> },
    { label: 'Réglages', path: '/settings', icon: <SettingsIcon size={18} /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  // Calculate Level Progress
  const levelProgress = getLevelProgress(gamification?.xp || 0, gamification?.level || 1);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>LearningOn<span style={{ color: 'var(--accent-primary)' }}>Guitar</span></h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`btn-ghost`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 500 : 400
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Gamification Stats */}
      {gamification && (
        <Link to="/level-history" className="sidebar-gamification" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="level-info">
            <div className="level-badge">
              <Trophy size={14} color="#fbbf24" />
              <span>Niveau {gamification.level || 1}</span>
            </div>
            <div className="streak-badge">
              <Flame size={14} color="#f87171" />
              <span>{gamification.currentStreak || 0} jours</span>
            </div>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${levelProgress}%` }}></div>
          </div>
          <div className="xp-text">
            {gamification.xp || 0} XP / {levelProgress}%
          </div>
        </Link>
      )}

      {/* User section at bottom */}
      <div className="sidebar-user">
        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          padding: '0.5rem',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)'
        }}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={16} />
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.displayName || 'Utilisateur'}
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>

      <style>{`
        .sidebar-gamification {
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid rgba(255,255,255,0.05);
            cursor: pointer;
            transition: background 0.2s;
        }
        .sidebar-gamification:hover {
            background: rgba(255,255,255,0.08);
        }

        .level-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            font-weight: bold;
        }

        .level-badge, .streak-badge {
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .xp-bar-container {
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 0.3rem;
        }

        .xp-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-primary), #a5b4fc);
            border-radius: 3px;
            transition: width 0.5s ease-out;
        }

        .xp-text {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-align: right;
        }
      `}</style>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Bibliothèque', path: '/library', icon: <Book size={22} /> },
    { label: 'Nouvelle', path: '/editor', icon: <Edit size={22} /> },
    { label: 'Accords', path: '/chords', icon: <Music size={22} /> },
    { label: 'Réglages', path: '/settings', icon: <SettingsIcon size={22} /> },
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {navItems.map((item) => {
          const isActive = item.path === '/editor'
            ? location.pathname === '/editor'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default App;
