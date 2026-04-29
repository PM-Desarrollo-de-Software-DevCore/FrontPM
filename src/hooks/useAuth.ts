'use client'

/* 
Este hook centraliza toda la lógica de autenticación.

Permite a cualquier componente hacer: 

const { user, login, logout } = useAuth()

sin tener que repetir lógica.

*/

import { useEffect, useState } from 'react'
import { LoginResult, User, UserRole } from '@/types/auth'
import { getCurrentUser, getDashboardRouteByRole, loginUser, logout as logoutUser, getToken } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Verificar sesión al cargar app
  // Este useEffect corre cuando el componente se monta.
  // Solo verifica si hay un token guardado (sesión existente).
  // Si no hay token, no intenta conectar con el servidor.
  useEffect(() => {
    async function checkUser() {
      try {
        const token = getToken()
        
        // Si no hay token, no intentes verificar sesión
        if (!token) {
          setIsLoading(false)
          return
        }

        const currentUser = await getCurrentUser()

        if (currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Error verificando usuario:', err)
      } finally {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [])

  // Función Login
  // Llama al servicio loginUser del backend.
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
      } else {
        setError(response.message || 'Error al iniciar sesión')
        return { success: false }
      }
    } catch (err) {
      setError('Error al iniciar sesión')
      console.error(err)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  // Función Logout
  // Limpia el token y el estado del usuario
  function logout() {
    logoutUser()

    setUser(null)
    setIsAuthenticated(false)
  }

  // Función hasRole
  // Verifica si el usuario tiene un rol específico
  function hasRole(requiredRole: UserRole): boolean {
    if (!user) return false

    return user.role === requiredRole
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    hasRole,
  }
}
