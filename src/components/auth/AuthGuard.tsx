'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardRouteByRole } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (pathname.startsWith('/dashboard')) {
      const allowedDashboardRoute = getDashboardRouteByRole(user?.role)
      const isOnAllowedDashboard =
        pathname === allowedDashboardRoute || pathname.startsWith(`${allowedDashboardRoute}/`)

      if (!isOnAllowedDashboard) {
        router.replace(allowedDashboardRoute)
      }
    }
  }, [isLoading, isAuthenticated, pathname, router, user?.role])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Verificando sesión...
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}