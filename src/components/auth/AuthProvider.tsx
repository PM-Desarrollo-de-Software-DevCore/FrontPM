'use client'

/*
Provee la sesión de autenticación a toda la app. Se monta UNA vez en el layout
raíz, verifica la sesión (GET /auth/me, con reintentos en getCurrentUser) una
sola vez, y expone el estado vía contexto. Las páginas leen con useAuth() sin
volver a pedir /auth/me en cada navegación.
*/

import { useEffect, useState } from 'react'
import { LoginResult, User, UserRole } from '@/types/auth'
import {
  getCurrentUser,
  getDashboardRouteByRole,
  getToken,
  loginUser,
  logout as logoutUser,
} from '@/lib/auth'
import { AuthContext, AuthContextValue } from '@/hooks/useAuth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verifica la sesión una sola vez al montar (a nivel app, no por página).
  useEffect(() => {
    let cancelled = false

    async function checkUser() {
      try {
        const token = getToken()
        if (!token) {
          if (!cancelled) setIsLoading(false)
          return
        }

        const currentUser = await getCurrentUser()
        if (!cancelled && currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Error verificando usuario:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    checkUser()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string): Promise<LoginResult> {
    try {
      setIsLoading(true)
      setError(null)

      const response = await loginUser(email, password)

      if (response.success && response.data?.token) {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          setError('No se pudo obtener la sesión del usuario')
          return { success: false }
        }

        setUser(currentUser)
        setIsAuthenticated(true)
        return {
          success: true,
          redirectTo: getDashboardRouteByRole(currentUser.role),
        }
      }

      setError(response.message || 'Error al iniciar sesión')
      return { success: false }
    } catch (err) {
      setError('Error al iniciar sesión')
      console.error(err)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    logoutUser()
    setUser(null)
    setIsAuthenticated(false)
  }

  function hasRole(requiredRole: UserRole): boolean {
    return user?.role === requiredRole
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
