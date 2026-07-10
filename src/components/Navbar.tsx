import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ThunderLogo from './ThunderLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="glass-card sticky top-0 z-40 mx-auto mb-8 flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
      {/* Left: Logo + Welcome */}
      <div className="flex items-center gap-3">
        <ThunderLogo size="sm" />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-cc-muted)' }}
        >
          Welcome, Admin
        </span>
      </div>

      {/* Right: Navigation + Theme + Logout */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-violet-200/70 bg-white/70 p-1 text-sm">
          <NavLink
            to="/dashboard"
            className={`rounded-full px-3 py-2 transition ${location.pathname === '/dashboard' ? 'bg-violet-600 text-white' : 'text-slate-700'}`}
          >
            Verification Dashboard
          </NavLink>
          <NavLink
            to="/events"
            className={`rounded-full px-3 py-2 transition ${location.pathname.startsWith('/events') ? 'bg-violet-600 text-white' : 'text-slate-700'}`}
          >
            Event Management
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/70 bg-violet-50/60 text-base transition hover:border-violet-300 hover:bg-violet-100"
          style={
            theme === 'dark'
              ? { background: 'rgba(167,139,255,0.12)', borderColor: 'rgba(167,139,255,0.3)' }
              : undefined
          }
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          style={
            theme === 'dark'
              ? {
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(167,139,255,0.25)',
                  color: '#c4b5fd',
                }
              : undefined
          }
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}