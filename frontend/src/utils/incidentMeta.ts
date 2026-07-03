import type { Category, IncidentStatus, Severity } from '../types/incident';

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#8b5cf6',
  RESOLVED: '#22c55e',
  CLOSED: '#64748b',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: '#64748b',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  NETWORKING: '#0ea5e9',
  INFRASTRUCTURE: '#6366f1',
  DATABASE: '#14b8a6',
  APPLICATION: '#a855f7',
  SECURITY: '#ef4444',
  HARDWARE: '#f59e0b',
  OTHER: '#64748b',
};

export function categoryLabel(category: Category): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
