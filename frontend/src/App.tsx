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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                <path
                  fillRule="evenodd"
                  d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
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
