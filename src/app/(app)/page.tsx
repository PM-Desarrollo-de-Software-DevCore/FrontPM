"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/hooks/useAuth'
import { getDashboardRouteByRole } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user) {
      router.replace(getDashboardRouteByRole(user.role))
    } else {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, user, router])

  return null
}