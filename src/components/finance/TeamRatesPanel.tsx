"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil } from "lucide-react"

import { ProjectMemberFinance } from "@/types/finance"
import { getProjectFinanceMembers } from "@/services/financeMembersService"
import { getProjectMembers } from "@/services/userService"
import { useProjectRole } from "@/hooks/useProjectRole"
import { formatMoney, formatNumber } from "@/lib/utils"
import MemberRateModal from "@/components/finance/MemberRateModal"

const ROLE_LABELS: Record<string, string> = {
  project_manager: "Project Manager",
  scrum_master: "Scrum Master",
  developer: "Developer",
  team_lead: "Team Lead",
}

export default function TeamRatesPanel({ projectId }: { projectId: string }) {
  const { canSeeRates, canManageMembers } = useProjectRole(projectId)
  const [members, setMembers] = useState<ProjectMemberFinance[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ProjectMemberFinance | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [financeMembers, users] = await Promise.all([
        getProjectFinanceMembers(projectId),
        getProjectMembers(projectId).catch(() => []),
      ])

      const nameMap: Record<string, string> = {}
      users.forEach((user) => {
        nameMap[user.id] = `${user.name ?? ""} ${user.lastname ?? ""}`.trim()
      })

      setMembers(financeMembers)
      setNames(nameMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los miembros del proyecto.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const nameOf = (member: ProjectMemberFinance) => names[member.id_user] || member.id_user

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-slate-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    )
  }

  const colSpan = 3 + (canSeeRates ? 1 : 0) + (canManageMembers ? 1 : 0)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Miembro</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2 text-right">FTE</th>
                {canSeeRates && <th className="px-3 py-2 text-right">Tarifa mensual</th>}
                {canManageMembers && <th className="px-3 py-2 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-3 py-8 text-center text-slate-400">
                    Este proyecto no tiene miembros.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id_mp} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-3 py-2 font-medium text-slate-800">{nameOf(member)}</td>
                    <td className="px-3 py-2 text-slate-500">{ROLE_LABELS[member.role] ?? member.role}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(member.fte, "N/A", 2)}</td>
                    {canSeeRates && (
                      <td className="px-3 py-2 text-right">{formatMoney(member.monthly_rate)}</td>
                    )}
                    {canManageMembers && (
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setEditing(member)}
                          aria-label="Editar miembro"
                          className="rounded-md border border-transparent p-1.5 text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!canSeeRates && (
        <p className="text-xs text-slate-400">
          La tarifa mensual solo es visible para administradores o el PM del proyecto.
        </p>
      )}

      {editing && (
        <MemberRateModal
          projectId={projectId}
          member={editing}
          memberName={nameOf(editing)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
