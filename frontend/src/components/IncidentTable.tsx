import { Link } from 'react-router-dom';
import type { Incident } from '../types/incident';
import { SeverityBadge, StatusBadge } from './Badges';
import { formatDateTime } from '../utils/format';
import { CATEGORY_COLORS, categoryLabel } from '../utils/incidentMeta';

interface Props {
  incidents: Incident[];
}

export default function IncidentTable({ incidents }: Props) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No incidents found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Title
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 md:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:table-cell">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {incidents.map((incident) => (
            <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3">
                <Link
                  to={`/incidents/${incident.id}`}
                  className="font-medium text-slate-900 hover:text-blue-700 hover:underline dark:text-slate-100 dark:hover:text-blue-400"
                >
                  {incident.title}
                </Link>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[incident.category] }}
                  />
                  {categoryLabel(incident.category)}
                </span>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={incident.severity} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={incident.status} />
              </td>
              <td className="hidden px-4 py-3 text-sm text-slate-500 dark:text-slate-400 sm:table-cell">
                {formatDateTime(incident.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
