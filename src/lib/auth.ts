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

/* Función para obtener el usuario autenticado | GET /auth/me
 * Reintenta ante errores de red o 5xx (blips de Render) para que la sesión se
 * obtenga de forma confiable en redes inestables. NO reintenta en 401 (token
 * inválido) ni borra el token salvo en ese caso. */
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken()

  if (!token) {
    return null
  }

  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        // Token rechazado por el servidor: invalidar sesión, sin reintentar.
        localStorage.removeItem('authToken')
        return null
      }

      if (!response.ok) {
        // 5xx u otro: probablemente un blip; reintentar antes de rendirse.
        if (attempt === maxAttempts) return null
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt))
        continue
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
      // Error de red (Failed to fetch): reintentar; el token se conserva.
      if (attempt === maxAttempts) {
        console.error('Error obtenido usuario:', error)
        return null
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt))
    }
  }

  return null
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

      // /health es el endpoint de warmup del backend (Render tiene cold starts);
      // es más ligero que /auth/me y no depende de autenticación.
      await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
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