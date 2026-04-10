'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

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