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

  // Verificación del servidor en SEGUNDO PLANO: NO bloquea el formulario.
  // Solo sirve para mostrar un aviso no-bloqueante si el backend está frío
  // (cold start de Render). El usuario puede empezar a escribir de inmediato.
  useEffect(() => {
    if (isLoading || isAuthenticated || serverConnected !== null) {
      return
    }
    let cancelled = false
    checkServerConnection().then((ok) => {
      if (!cancelled) setServerConnected(ok)
    })
    return () => {
      cancelled = true
    }
  }, [isLoading, isAuthenticated, serverConnected])

  // Mientras se verifica la sesión (rápido si no hay token)
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

  // El formulario se muestra de INMEDIATO (no se bloquea por el cold start del
  // backend). Si el servidor aún no responde, se avisa sin bloquear.
  return (
    <main>
      {serverConnected === false && (
        <div className="mx-auto w-full max-w-md px-4 pt-4">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
            El servidor está despertando; el primer inicio de sesión puede tardar unos segundos.
          </p>
        </div>
      )}
      <LoginForm />
    </main>
  )
}
