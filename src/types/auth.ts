/**
 * Este archivo define todos los tipos TypeScript
 * relacionados con el sistema de autenticación.
 *
 * Centralizar los tipos ayuda a:
 * - Evitar duplicación
 * - Mejorar autocompletado
 * - Detectar errores temprano
 */

export type UserRole = 'project_manager' | 'scrum_master' | 'user'

export interface LoginResult {
  success: boolean
  redirectTo?: string
}

export interface User {
  id: string
  email: string
  name: string
  lastname: string
  role: UserRole
  avatar?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    token?: string
    user?: User
  }
}

export interface AuthContext {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}
