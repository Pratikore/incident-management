import { useNavigate } from 'react-router-dom';
import type { Incident } from '../types/incident';
import { SeverityBadge, StatusBadge } from './Badges';
import { formatDateTime } from '../utils/format';
import { CATEGORY_COLORS, categoryLabel } from '../utils/incidentMeta';

interface Props {
  incidents: Incident[];
}

export default function IncidentTable({ incidents }: Props) {
  const navigate = useNavigate();
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
              ID
            </th>
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
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:table-cell">
              Reported by
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:table-cell">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => navigate(`/incidents/${incident.id}`)}
              className="cursor-pointer transition-colors hover:bg-blue-50/70 dark:hover:bg-slate-800/60"
            >
              <td className="whitespace-nowrap px-4 py-3">
                <span className="font-mono text-xs font-medium text-blue-700 dark:text-blue-400">
                  {incident.reference}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-slate-900 dark:text-slate-100">{incident.title}</span>
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
              <td className="hidden px-4 py-3 text-sm text-slate-600 dark:text-slate-300 lg:table-cell">
                {incident.createdBy ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-semibold uppercase text-white">
                      {incident.createdBy.slice(0, 2)}
                    </span>
                    {incident.createdBy}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
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
