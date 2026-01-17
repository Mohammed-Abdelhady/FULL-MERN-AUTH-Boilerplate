/**
 * User role enumeration
 */
export type UserRole = 'user' | 'admin' | 'manager' | 'support';

/**
 * User entity representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Authentication state managed by Redux
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

/**
 * Auth error details
 */
export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Registration response from API
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
}

/**
 * Account activation request payload
 */
export interface ActivateRequest {
  email: string;
  code: string;
}

/**
 * Account activation response from API
 */
export interface ActivateResponse {
  token: string;
  user: User;
}
