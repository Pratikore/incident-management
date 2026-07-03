import { CATEGORIES, SEVERITIES, STATUSES } from '../types/incident';
import type { IncidentFilters as Filters, Severity, IncidentStatus, Category } from '../types/incident';
import { statusLabel } from '../utils/format';
import { categoryLabel } from '../utils/incidentMeta';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function IncidentFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label htmlFor="filter-severity" className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Severity
        </label>
        <select
          id="filter-severity"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={filters.severity ?? ''}
          onChange={(e) =>
            onChange({ ...filters, severity: (e.target.value || undefined) as Severity | undefined })
          }
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="filter-status" className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Status
        </label>
        <select
          id="filter-status"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={filters.status ?? ''}
          onChange={(e) =>
            onChange({ ...filters, status: (e.target.value || undefined) as IncidentStatus | undefined })
          }
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="filter-category" className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Category
        </label>
        <select
          id="filter-category"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={filters.category ?? ''}
          onChange={(e) =>
            onChange({ ...filters, category: (e.target.value || undefined) as Category | undefined })
          }
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </div>

      {(filters.severity || filters.status || filters.category) && (
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          onClick={() => onChange({})}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
