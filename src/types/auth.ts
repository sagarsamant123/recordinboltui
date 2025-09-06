export interface User {
  id?: string;
  _id?: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupRequestData {
  email: string;
  reason: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface TokenValidationResponse {
  success: boolean;
  valid: boolean;
  user?: User;
  message?: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequestsResponse {
  success: boolean;
  requests: AccessRequest[];
}

export interface GeneratePasswordsRequest {
  emails: string[];
}

export interface GeneratedPassword {
  email: string;
  password: string;
}

export interface GeneratePasswordsResponse {
  success: boolean;
  message: string;
  results: GeneratedPassword[];
}

export type AuthMode = 'preview' | 'login' | 'signup' | 'pending' | 'authenticated';