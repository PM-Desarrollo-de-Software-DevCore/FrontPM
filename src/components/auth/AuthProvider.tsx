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
  syncSessionCookie,
} from '@/lib/auth'
import { AuthContext, AuthContextValue } from '@/hooks/useAuth'
import { getUserProfileDetails } from '@/services/userService'

/*
skill/área/foto NO vienen en /auth/me. La única fuente del backend es GET /users
(el front filtra por id). Lo hacemos UNA vez aquí —no por página— para que estos
campos vivan en la sesión compartida y estable, en vez de en un fetch por página
que se re-ejecuta/cancela con la red inestable. Si /users falla, conservamos la
sesión básica (name/email/role) y skill/área quedan sin definir.
*/
async function enrichUserWithProfile(baseUser: User): Promise<User> {
  try {
    const details = await getUserProfileDetails(baseUser.id)
    return {
      ...baseUser,
      skill: details.skill,
      area: details.area,
      profileImageUrl: details.profileImageUrl,
    }
  } catch {
    return baseUser
  }
}

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
          // Sesión básica primero (name/email/role): basta para rutear y renderizar.
          setUser(currentUser)
          setIsAuthenticated(true)
          // Backfill del espejo httpOnly (PM-171 Fase 0): las sesiones abiertas
          // antes del deploy solo tienen el token en localStorage. Re-mintamos la
          // cookie en cada rehidratación válida (no se puede leer una cookie
          // httpOnly desde JS para condicionarlo, así que es idempotente).
          // syncSessionCookie revalida que `token` siga vigente antes de escribir.
          void syncSessionCookie(token)
          // Enriquecer skill/área/foto desde /users en SEGUNDO PLANO: NO bloquea
          // isLoading (igual que en login()). Antes se hacía `await` aquí, así que
          // "Loading session" esperaba /auth/me + /users (2 round-trips a Render).
          enrichUserWithProfile(currentUser)
            .then((enriched) => { if (!cancelled) setUser(enriched) })
            .catch(() => {})
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
        // Enriquecer skill/área/foto en segundo plano: no bloquea el redirect.
        enrichUserWithProfile(currentUser)
          .then((enriched) => setUser(enriched))
          .catch(() => {})
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
