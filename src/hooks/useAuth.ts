'use client'

/*
Sesión compartida vía contexto.

El estado de autenticación (usuario, login, logout) vive en <AuthProvider>
(montado una sola vez en la raíz). useAuth() solo lo lee, así que la sesión se
obtiene UNA vez y se comparte entre todas las páginas, en lugar de que cada
componente vuelva a pedir /auth/me al montar.
*/

import { createContext, useContext } from 'react'
import { LoginResult, User, UserRole } from '@/types/auth'

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }

  return context
}
