"use client"

import LoginForm from '@/components/auth/LoginForm'
import LoadingScreen from '@/components/auth/LoadingScreen'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardRouteByRole, checkServerConnection } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, user } = useAuth()
  const [serverConnected, setServerConnected] = useState<boolean | null>(null)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDashboardRouteByRole(user?.role))
    }
  }, [isLoading, isAuthenticated, router, user?.role])

  // Verificar conexión con servidor solo si no está autenticado
  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isAuthenticated) {
      return
    }

    async function verifyServerConnection() {
      const isConnected = await checkServerConnection()
      setServerConnected(isConnected)
    }

    // Solo verificar una sola vez
    if (serverConnected === null) {
      verifyServerConnection()
    }
  }, [isLoading, isAuthenticated, serverConnected])

  // Mostrar pantalla de carga mientras se verifica sesión
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Cargando sesión" 
        subMessage="Verificando tus credenciales..."
      />
    )
  }

  // Si ya está autenticado, no mostrar nada (se redirigirá automáticamente)
  if (isAuthenticated) {
    return null
  }

  // Mostrar pantalla de conexión si servidor no responde
  if (serverConnected === false) {
    return (
      <LoadingScreen 
        message="Conectando con el Servidor" 
        subMessage="El servidor está en proceso de inicio, por favor espera..."
      />
    )
  }

  // Mostrar formulario de login si servidor está disponible
  if (serverConnected === true) {
    return (
      <main>
        <LoginForm />
      </main>
    )
  }

  // Mientras se verifica la conexión (estado null)
  return (
    <LoadingScreen 
      message="Verificando conexión" 
      subMessage="Comprobando disponibilidad del servidor..."
    />
  )
}
