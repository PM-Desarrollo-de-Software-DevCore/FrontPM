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

const ROLE_ALIASES: Record<string, User['role']> = {
  admin: 'project_manager',
  developer: 'user',
  pm: 'project_manager',
  project_manager: 'project_manager',
  scrum_master: 'scrum_master',
  sm: 'scrum_master',
  user: 'user',
}

export function normalizeUserRole(role?: string | null): User['role'] {
  if (!role) {
    return 'user'
  }

  return ROLE_ALIASES[role.toLowerCase()] ?? 'user'
}

export function getDashboardRouteByRole(role?: string | null): string {
  const normalizedRole = normalizeUserRole(role)

  if (normalizedRole === 'project_manager') {
    return '/dashboard/pm'
  }

  if (normalizedRole === 'scrum_master') {
    return '/dashboard/sm'
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

/* Función para verificar conexión con el servidor */
export async function checkServerConnection(): Promise<boolean> {
  try {
    // Intentar hacer un fetch simple al endpoint de login
    // Si el servidor responde, aunque sea con error, significa que está disponible
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // Timeout de 5 segundos

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    
    // Si recibimos alguna respuesta del servidor, está disponible
    return true
  } catch (error) {
    console.error('Error verificando conexión con servidor:', error)
    return false
  }
}