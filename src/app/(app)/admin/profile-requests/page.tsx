"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getDashboardRouteByRole } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card/card"
import AdminProfileChangeRequests from "@/components/profile/AdminProfileChangeRequests"

export default function ProfileChangeRequestsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isAdmin = user?.role === "admin"

  // Solo admin: el backend ya valida el acceso, pero evitamos mostrar la
  // pantalla a un no-admin que navegue directo a la URL.
  useEffect(() => {
    if (isLoading) return
    if (user && !isAdmin) {
      router.replace(getDashboardRouteByRole(user.role))
    }
  }, [isLoading, user, isAdmin, router])

  if (isLoading || (user && !isAdmin)) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Cargando...
      </main>
    )
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-strong">
          Solicitudes de cambio de perfil
        </h1>

        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <AdminProfileChangeRequests />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
