"use client"

import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardRouteByRole } from '@/lib/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDashboardRouteByRole(user?.role))
    }
  }, [isLoading, isAuthenticated, router, user?.role])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Cargando sesión...
      </main>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <main>
      <LoginForm />
    </main>
  )
}