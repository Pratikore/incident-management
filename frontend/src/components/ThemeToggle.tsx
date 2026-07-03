import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/60 bg-white/60 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm5.657 2.343a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 1 1-1.06-1.06l1.59-1.592a.75.75 0 0 1 1.06 0Zm-11.314 0a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.06 1.06L6.343 5.654a.75.75 0 0 1 0-1.06ZM12 6.75A5.25 5.25 0 1 0 12 17.25 5.25 5.25 0 0 0 12 6.75ZM3 12a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm15 0a.75.75 0 0 1 .75-.75H21a.75.75 0 0 1 0 1.5h-2.25A.75.75 0 0 1 18 12Zm-2.343 5.657a.75.75 0 0 1 1.06 0l1.591 1.59a.75.75 0 1 1-1.06 1.061l-1.591-1.59a.75.75 0 0 1 0-1.061Zm-7.314 0a.75.75 0 0 1 0 1.06l-1.59 1.592a.75.75 0 0 1-1.061-1.06l1.59-1.592a.75.75 0 0 1 1.061 0ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
