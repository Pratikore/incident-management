import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createIncident,
  getIncident,
  listIncidents,
  updateStatus,
} from '../api/client';
import type {
  CreateIncidentRequest,
  IncidentFilters,
  IncidentStatus,
} from '../types/incident';

export const incidentKeys = {
  all: ['incidents'] as const,
  list: (filters: IncidentFilters) => ['incidents', 'list', filters] as const,
  detail: (id: string) => ['incidents', 'detail', id] as const,
};

export function useIncidents(filters: IncidentFilters) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => listIncidents(filters),
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => getIncident(id),
    enabled: Boolean(id),
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncidentRequest) => createIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}

export function useUpdateStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: IncidentStatus) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}
