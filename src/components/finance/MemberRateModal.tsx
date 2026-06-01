"use client"

import { useState } from "react"

import { ProjectMemberFinance, ProjectMemberRole } from "@/types/finance"
import { updateProjectFinanceMember } from "@/services/financeMembersService"

const ROLE_OPTIONS: { value: ProjectMemberRole; label: string }[] = [
  { value: "project_manager", label: "Project Manager" },
  { value: "scrum_master", label: "Scrum Master" },
  { value: "developer", label: "Developer" },
  { value: "team_lead", label: "Team Lead" },
]

type MemberRateModalProps = {
  projectId: string
  member: ProjectMemberFinance
  memberName: string
  onClose: () => void
  onSaved: () => void
}

export default function MemberRateModal({
  projectId,
  member,
  memberName,
  onClose,
  onSaved,
}: MemberRateModalProps) {
  const [role, setRole] = useState<ProjectMemberRole>(member.role)
  const [fte, setFte] = useState(member.fte !== null && member.fte !== undefined ? String(member.fte) : "")
  const [rate, setRate] = useState(
    member.monthly_rate !== null && member.monthly_rate !== undefined ? String(member.monthly_rate) : ""
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await updateProjectFinanceMember(projectId, member.id_user, {
        role,
        fte: fte.trim() === "" ? null : Number(fte),
        monthly_rate: rate.trim() === "" ? null : Number(rate),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el miembro.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">Editar miembro</h3>
        <p className="mb-4 text-sm text-slate-500">{memberName}</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Rol</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as ProjectMemberRole)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">FTE (0–1)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={fte}
              onChange={(event) => setFte(event.target.value)}
              placeholder="Ej: 0.5"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Tarifa mensual</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              placeholder="Sin tarifa"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:shadow-sm disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
