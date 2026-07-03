import { useState } from 'react';
import IncidentFilters from '../components/IncidentFilters';
import IncidentTable from '../components/IncidentTable';
import CreateIncidentModal from '../components/CreateIncidentModal';
import { useIncidents } from '../hooks/useIncidents';
import type { IncidentFilters as Filters } from '../types/incident';

export default function IncidentsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [showCreate, setShowCreate] = useState(false);
  const { data: incidents, isLoading, isError, error } = useIncidents(filters);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Incidents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, filter, and update operational incidents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500"
        >
          + New Incident
        </button>
      </div>

      <IncidentFilters filters={filters} onChange={setFilters} />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading incidents...</p>}
      {isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load incidents'}
        </p>
      )}
      {incidents && <IncidentTable incidents={incidents} />}

      {showCreate && <CreateIncidentModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
