export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export type IncidentStatus = (typeof STATUSES)[number];

export const CATEGORIES = [
  'NETWORKING',
  'INFRASTRUCTURE',
  'DATABASE',
  'APPLICATION',
  'SECURITY',
  'HARDWARE',
  'OTHER',
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Incident {
  id: string;
  reference: string;
  title: string;
  description: string;
  severity: Severity;
  category: Category;
  status: IncidentStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  aiSummary?: string | null;
  aiRootCause?: string | null;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: Severity;
  category: Category;
}

export interface SeverityRecommendation {
  severity: Severity;
  rationale: string;
}

export interface AiTextResponse {
  text: string;
  aiGenerated: boolean;
}

export interface IncidentFilters {
  severity?: Severity;
  status?: IncidentStatus;
  category?: Category;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  text: string;
  aiGenerated: boolean;
}
