import type { IncidentStatus, Severity } from '../types/incident';
import { statusLabel } from '../utils/format';

const severityStyles: Record<Severity, string> = {
  LOW: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  HIGH: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-900',
  CRITICAL: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900',
};

const statusStyles: Record<IncidentStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900',
  IN_PROGRESS: 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900',
  RESOLVED: 'bg-green-100 text-green-800 ring-green-200 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-900',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
};

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset';

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`${base} ${severityStyles[severity]}`}>{severity}</span>;
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return <span className={`${base} ${statusStyles[status]}`}>{statusLabel(status)}</span>;
}
