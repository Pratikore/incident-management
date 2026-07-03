import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ThemeToggle from './components/ThemeToggle';
import ChatWidget from './components/ChatWidget';

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
    isActive
      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60',
  ].join(' ');
}

export default function App() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-20 rounded-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow">
              IM
            </span>
            <span className="hidden text-lg font-semibold text-slate-900 dark:text-white sm:block">
              Incident Management
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/incidents" className={navClass}>
              Incidents
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={navClass}>
                Users
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300/60 bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="glass mt-8 rounded-none">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-slate-500 dark:text-slate-400 sm:flex-row">
          <p>Incident Management &middot; Monitoring Dashboard</p>
          <p className="text-xs">Built with React, Spring Boot &amp; Tailwind CSS</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
