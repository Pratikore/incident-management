export const ROLES = ['ADMIN', 'USER'] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  username: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: Role;
}

export interface User {
  id: string;
  username: string;
  email?: string | null;
  role: Role;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
}
