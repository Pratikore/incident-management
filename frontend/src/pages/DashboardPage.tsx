import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useIncidents } from '../hooks/useIncidents';
import CreateIncidentModal from '../components/CreateIncidentModal';
import { CATEGORIES, SEVERITIES, STATUSES } from '../types/incident';
import type { Incident } from '../types/incident';
import { statusLabel } from '../utils/format';
import { CATEGORY_COLORS, SEVERITY_COLORS, STATUS_COLORS, categoryLabel } from '../utils/incidentMeta';

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">No data yet.</div>
  );
}

function buildTrend(incidents: Incident[]) {
  const days: { label: string; key: string; count: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count: 0 });
  }
  const index = new Map(days.map((d) => [d.key, d]));
  for (const incident of incidents) {
    const key = incident.createdAt?.slice(0, 10);
    const bucket = key ? index.get(key) : undefined;
    if (bucket) bucket.count += 1;
  }
  return days;
}

// A lightweight health score: start at 100 and subtract weighted penalties
// for unresolved work, weighting critical and high severity more heavily.
function healthScore(incidents: Incident[]) {
  const active = incidents.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
  let penalty = 0;
  for (const i of active) {
    if (i.severity === 'CRITICAL') penalty += 22;
    else if (i.severity === 'HIGH') penalty += 12;
    else if (i.severity === 'MEDIUM') penalty += 5;
    else penalty += 2;
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

export default function DashboardPage() {
  const { data: incidents, isLoading, isError, error, refetch } = useIncidents({});
  const [showCreate, setShowCreate] = useState(false);

  const stats = useMemo(() => {
    const list = incidents ?? [];
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
    const bySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<string, number>;
    const byCategory = Object.fromEntries(CATEGORIES.map((s) => [s, 0])) as Record<string, number>;
    for (const incident of list) {
      byStatus[incident.status] += 1;
      bySeverity[incident.severity] += 1;
      byCategory[incident.category] += 1;
    }
    const criticalOpen = list.filter(
      (i) => i.severity === 'CRITICAL' && (i.status === 'OPEN' || i.status === 'IN_PROGRESS'),
    ).length;
    const resolvedTotal = byStatus.RESOLVED + byStatus.CLOSED;
    const resolutionRate = list.length ? Math.round((resolvedTotal / list.length) * 100) : 0;
    return {
      byStatus,
      bySeverity,
      byCategory,
      total: list.length,
      criticalOpen,
      resolutionRate,
      score: healthScore(list),
      trend: buildTrend(list),
    };
  }, [incidents]);

  const hasData = stats.total > 0;
  const statusData = STATUSES.map((s) => ({ name: statusLabel(s), key: s, value: stats.byStatus[s] }));
  const severityData = SEVERITIES.map((s) => ({ name: s, key: s, value: stats.bySeverity[s] }));
  const categoryData = CATEGORIES.map((c) => ({ name: categoryLabel(c), key: c, value: stats.byCategory[c] }))
    .filter((d) => d.value > 0);

  const scoreColor = stats.score >= 75 ? '#22c55e' : stats.score >= 45 ? '#f59e0b' : '#ef4444';
  const scoreLabel = stats.score >= 75 ? 'Healthy' : stats.score >= 45 ? 'Degraded' : 'At risk';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monitoring Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time overview of incident volume, health, status, severity, and category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-300/60 bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500"
          >
            + New Incident
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>}
      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          <p>{error instanceof Error ? error.message : 'Failed to load dashboard'}</p>
          <button type="button" onClick={() => refetch()} className="mt-2 font-medium underline">
            Try again
          </button>
        </div>
      )}

      {incidents && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total" value={stats.total} accent="bg-slate-400" />
            <StatCard label="Open" value={stats.byStatus.OPEN} accent="bg-blue-500" />
            <StatCard label="In Progress" value={stats.byStatus.IN_PROGRESS} accent="bg-violet-500" />
            <StatCard label="Resolved" value={stats.byStatus.RESOLVED} accent="bg-green-500" />
            <StatCard label="Critical open" value={stats.criticalOpen} accent="bg-red-500" />
            <StatCard label="Resolution %" value={stats.resolutionRate} accent="bg-teal-500" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel title="System health">
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: 'Health', value: stats.score, fill: scoreColor }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={12} background />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.score}%</span>
                  <span className="text-sm font-medium" style={{ color: scoreColor }}>
                    {scoreLabel}
                  </span>
                  <span className="mt-0.5 text-xs text-slate-400">
                    {hasData ? `${stats.criticalOpen} critical open` : 'All systems operational'}
                  </span>
                </div>
              </div>
            </Panel>

            <Panel title="Incidents by status">
              {hasData ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusData.filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={48}
                      paddingAngle={2}
                    >
                      {statusData
                        .filter((d) => d.value > 0)
                        .map((entry) => (
                          <Cell key={entry.key} fill={STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </Panel>

            <Panel title="Incidents by severity">
              {hasData ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={severityData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {severityData.map((entry) => (
                        <Cell key={entry.key} fill={SEVERITY_COLORS[entry.key as keyof typeof SEVERITY_COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Incidents by category">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                    <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                    <YAxis type="category" dataKey="name" width={90} stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {categoryData.map((entry) => (
                        <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key as keyof typeof CATEGORY_COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </Panel>

            <Panel title="New incidents (last 7 days)">
              {hasData ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stats.trend}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{ stroke: '#6366f1' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#trendFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </Panel>
          </div>

          <div className="flex justify-end">
            <Link
              to="/incidents"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500"
            >
              View all incidents
            </Link>
          </div>
        </>
      )}

      {showCreate && <CreateIncidentModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
