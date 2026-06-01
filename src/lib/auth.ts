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
  data?: BackendUser
}

type BackendUser = Omit<User, 'role'> & {
  role: string
}

export function normalizeUserRole(role?: string | null): User['role'] {
  if (!role) return 'user'

  const r = role.toLowerCase()
  if (r === 'admin') return 'admin'
  return 'user'
}

export function getDashboardRouteByRole(role?: string | null): string {
  const normalizedRole = normalizeUserRole(role)

  if (normalizedRole === 'admin') {
    return '/dashboard/admin'
  }

  return '/dashboard/user'
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

    return {
      ...data.data,
      role: normalizeUserRole(data.data.role),
    }
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

/* Función para verificar conexión con el servidor con reintentos */
export async function checkServerConnection(): Promise<boolean> {
  const maxRetries = 7 // Máximo de intentos
  const initialDelay = 1000 // 1 segundo inicial
  const timeout = 10000 // 10 segundos por petición individual

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      await fetch(API_BASE_URL, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      
      // Si recibimos alguna respuesta del servidor, está disponible
      return true
    } catch (error) {
      // Si es el último intento, log del error final
      if (attempt === maxRetries) {
        console.error('Error verificando conexión con servidor después de múltiples intentos:', error)
        return false
      }

      // Calcular delay progresivo: 1s, 2s, 4s, 8s, 16s (exponencial)
      const delay = initialDelay * Math.pow(2, attempt - 1)
      console.log(`Intento ${attempt}/${maxRetries} fallido. Reintentando en ${delay}ms...`)
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return false
}