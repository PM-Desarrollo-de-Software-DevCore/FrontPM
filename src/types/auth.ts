/**
 * Este archivo define todos los tipos TypeScript
 * relacionados con el sistema de autenticación.
 *
 * Centralizar los tipos ayuda a:
 * - Evitar duplicación
 * - Mejorar autocompletado
 * - Detectar errores temprano
 */

export type UserRole = 'admin' | 'pm' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export interface AuthContext {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}