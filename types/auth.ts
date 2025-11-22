export type UserRole = 'CONSUMER' | 'BUSINESS';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}
