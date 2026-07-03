import type {
  AiChatResponse,
  AiTextResponse,
  ChatMessage,
  CreateIncidentRequest,
  Incident,
  IncidentFilters,
  IncidentStatus,
  SeverityRecommendation,
} from '../types/incident';
import type { CreateUserRequest, LoginResponse, User } from '../types/auth';

const BASE_URL = '/api/incidents';
const TOKEN_KEY = 'im-token';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    let message = `Request failed with status ${response.status}`;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const body = await response.json();
      message = body.message ?? message;
      fieldErrors = body.errors;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message, fieldErrors);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// ----- Auth -----

export function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  try {
    await request<void>('/api/auth/logout', { method: 'POST' });
  } catch {
    // best-effort; token is cleared client-side regardless
  }
}

// ----- Users (admin) -----

export function listUsers(): Promise<User[]> {
  return request<User[]>('/api/users');
}

export function createUser(payload: CreateUserRequest): Promise<User> {
  return request<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listIncidents(filters: IncidentFilters = {}): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  if (filters.category) params.set('category', filters.category);
  const query = params.toString();
  return request<Incident[]>(query ? `${BASE_URL}?${query}` : BASE_URL);
}

export function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`${BASE_URL}/${id}`);
}

export function createIncident(payload: CreateIncidentRequest): Promise<Incident> {
  return request<Incident>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateStatus(id: string, status: IncidentStatus): Promise<Incident> {
  return request<Incident>(`${BASE_URL}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function recommendSeverity(
  title: string,
  description: string,
): Promise<SeverityRecommendation> {
  return request<SeverityRecommendation>(`${BASE_URL}/ai/severity-recommendation`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export function generateSummary(id: string): Promise<AiTextResponse> {
  return request<AiTextResponse>(`${BASE_URL}/${id}/ai/summary`, { method: 'POST' });
}

export function suggestRootCause(id: string): Promise<AiTextResponse> {
  return request<AiTextResponse>(`${BASE_URL}/${id}/ai/root-cause`, { method: 'POST' });
}

export function sendChatMessage(message: string, history: ChatMessage[]): Promise<AiChatResponse> {
  return request<AiChatResponse>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}
