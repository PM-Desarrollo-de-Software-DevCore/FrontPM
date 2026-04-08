'use client'

/* 
Este hook centraliza toda la lógica de autenticación.

Permite a cualquier componente hacer: 

const { user, login, logout } = useAuth()

sin tener que repetir lógica.

*/

import { useEffect, useState } from 'react'
import { User, UserRole } from '@/types/auth'
import { loginUser, getCurrentUser, logout as logoutUser } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Verificar sesión al cargar app
  // Este useEffect corre cuando el componente se monta.
  // Sirve para verificar si ya existe un usuario loggeado.
  useEffect(() => {
    async function checkUser() {
      try {
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
  async function login(email: string, password: string) {
    try {
      setIsLoading(true)
      setError(null)

      const response = await loginUser(email, password)

      if (response.success && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('Error al iniciar sesión')
      console.error(err)
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
    
    if (user.role === 'admin') return true // Admin tiene acceso a todo

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