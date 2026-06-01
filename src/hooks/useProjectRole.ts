"use client"

/**
 * Resuelve el rol del usuario actual dentro de un proyecto, combinando el rol
 * global (useAuth) con la membresía del proyecto (getProjectMembers).
 *
 * El backend solo expone admin|user a nivel global; el rol de proyecto
 * (project_manager, etc.) hay que derivarlo de la lista de miembros.
 *
 * Reglas del contrato de Finanzas (docs/finanzas-frontend.md):
 * - monthly_rate visible para admin global o PM del proyecto.
 * - gastos/facturas: gestionar = admin o PM; ver = cualquier miembro.
 * - miembros: gestionar = solo admin.
 */

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getProjectMembers, ProjectMemberRole } from "@/services/memberService"

export interface ProjectRole {
  isGlobalAdmin: boolean
  isProjectManager: boolean
  isMember: boolean
  /** Puede ver montos sensibles (monthly_rate). */
  canSeeRates: boolean
  /** Puede crear/editar/borrar gastos y facturas. */
  canManageFinance: boolean
  /** Puede gestionar miembros del proyecto (solo admin global). */
  canManageMembers: boolean
  loading: boolean
  error: string | null
}

export function useProjectRole(projectId: string | null | undefined): ProjectRole {
  const { user, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<ProjectMemberRole | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!projectId || !user) {
        // Sin proyecto resuelto o sin sesión aún: no hay rol de proyecto que cargar.
        setRole(null)
        setIsMember(false)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const members = await getProjectMembers(projectId)
        if (!active) return
        const mine = members.find((member) => member.userId === user.id)
        setIsMember(Boolean(mine))
        setRole(mine?.role ?? null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "No se pudo resolver el rol del proyecto.")
        setRole(null)
        setIsMember(false)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [projectId, user, authLoading])

  const isGlobalAdmin = user?.role === "admin"
  const isProjectManager = role === "project_manager"

  return {
    isGlobalAdmin,
    isProjectManager,
    isMember: isMember || isGlobalAdmin,
    canSeeRates: isGlobalAdmin || isProjectManager,
    canManageFinance: isGlobalAdmin || isProjectManager,
    canManageMembers: isGlobalAdmin,
    loading: authLoading || loading,
    error,
  }
}
