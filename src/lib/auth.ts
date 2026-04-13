/**
 * Este archivo centraliza todas las llamadas al backend
 * relacionadas con autenticación.
 *
 * Ventajas:
 * - Evita duplicar lógica de fetch
 * - Hace el código más mantenible
 * - Facilita cambiar endpoints en el futuro
 */

import { AuthResponse, User } from '@/types/auth'

type BackendLoginResponse = {
  success: boolean
  message?: string
  data?: {
    token?: string
  }
}

type BackendMeResponse = {
  success: boolean
  message?: string
  data?: User
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' /* API con fallback en localhost */

/* Función para iniciar sesión | POST /auth/login */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    const data: BackendLoginResponse = await response.json()

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Credenciales inválidas',
      }
    }

    const token = data.data?.token

    if (token) {
      localStorage.setItem('authToken', token)
    }

    return {
      success: true,
      message: data.message,
      data: {
        token,
      },
    }
  } catch (error) {
    console.error('Error en loginUser:', error)

    return {
      success: false,
      message: 'Error de conexión con el servidor',
    }
  }
}

/* Función para obtener el token de autenticación */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem('authToken')
}

/* Función para obtener el usuario autenticado | GET /auth/me */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getToken()

    if (!token) {
      return null
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      localStorage.removeItem('authToken')
      return null
    }

    const data: BackendMeResponse = await response.json()

    if (!data.success || !data.data) {
      return null
    }

    return data.data
  } catch (error) {
    console.error('Error obtenido usuario:', error)
    return null
  }
}

/* Función para cerrar sesión */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}