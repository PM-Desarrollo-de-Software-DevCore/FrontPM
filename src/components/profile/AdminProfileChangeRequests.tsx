"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ProfileChangeRequest,
  ProfileChangeStatus,
  approveProfileChangeRequest,
  getAllProfileChangeRequests,
  rejectProfileChangeRequest,
} from "@/services/profileChangeRequestService"
import { UserDirectoryEntry, getUsersDirectory } from "@/services/userService"

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  lastname: "Apellido",
  email: "Email",
  skill: "Skill",
  area: "Área",
}

type ActionState = {
  id: string | null
  kind: "approve" | "reject" | null
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

function statusBadgeStyles(status: ProfileChangeStatus): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    case "cancelled":
      return "bg-slate-100 text-slate-600"
    default:
      return "bg-amber-100 text-amber-700"
  }
}

interface RejectModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  submitting: boolean
}

function RejectModal({ open, onClose, onConfirm, submitting }: RejectModalProps) {
  const [note, setNote] = useState("")
  const [prevOpen, setPrevOpen] = useState(open)

  // Limpia la nota al abrir, durante el render (patrón recomendado por React
  // en lugar de setState dentro de un efecto).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setNote("")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-[min(94vw,28rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-base font-semibold text-slate-900">Rechazar solicitud</p>
          <p className="text-xs text-slate-500">El motivo se incluirá en la notificación al usuario (opcional).</p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Motivo</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Ej: El email ya está en uso por otro miembro."
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(note.trim())}
              disabled={submitting}
              className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Rechazando..." : "Rechazar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileChangeRequests() {
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([])
  const [usersById, setUsersById] = useState<Record<string, UserDirectoryEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<ActionState>({ id: null, kind: null })

  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [requestsData, directory] = await Promise.all([
        getAllProfileChangeRequests("pending"),
        getUsersDirectory().catch(() => [] as UserDirectoryEntry[]),
      ])

      setRequests(requestsData)
      setUsersById(
        directory.reduce<Record<string, UserDirectoryEntry>>((acc, entry) => {
          acc[entry.id] = entry
          return acc
        }, {})
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes.")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleApprove = async (requestId: string) => {
    setAction({ id: requestId, kind: "approve" })
    setError(null)

    try {
      await approveProfileChangeRequest(requestId)
      setRequests((prev) => prev.filter((entry) => entry.id_request !== requestId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar la solicitud.")
    } finally {
      setAction({ id: null, kind: null })
    }
  }

  const handleReject = async (note: string) => {
    if (!rejectTarget) return

    setAction({ id: rejectTarget, kind: "reject" })
    setError(null)

    try {
      await rejectProfileChangeRequest(rejectTarget, note || undefined)
      const id = rejectTarget
      setRequests((prev) => prev.filter((entry) => entry.id_request !== id))
      setRejectTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo rechazar la solicitud.")
    } finally {
      setAction({ id: null, kind: null })
    }
  }

  const fmtRequester = useMemo(() => {
    return (id: string) => {
      const user = usersById[id]
      if (!user) return id.slice(0, 8)
      const name = `${user.name ?? ""} ${user.lastname ?? ""}`.trim()
      return name ? `${name} · ${user.email}` : user.email
    }
  }, [usersById])

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold">Solicitudes de modificación pendientes</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{loading ? "Cargando..." : `${requests.length} pendientes`}</span>
          <button
            type="button"
            onClick={loadAll}
            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Refrescar
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando solicitudes...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>
        ) : (
          requests.map((request) => {
            const proposed = request.proposedChanges ?? {}
            const fieldsChanged = Object.keys(proposed)
            const isApproving = action.id === request.id_request && action.kind === "approve"
            const isRejecting = action.id === request.id_request && action.kind === "reject"

            return (
              <article
                key={request.id_request}
                className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {fmtRequester(request.id_user)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enviada {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeStyles(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>

                <ul className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-700 sm:grid-cols-2">
                  {fieldsChanged.map((field) => (
                    <li key={field} className="rounded-md bg-slate-50 px-2 py-1">
                      <span className="font-medium text-slate-900">
                        {FIELD_LABELS[field] ?? field}:
                      </span>{" "}
                      {formatChangeValue((proposed as Record<string, unknown>)[field])}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectTarget(request.id_request)}
                    disabled={isApproving || isRejecting}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(request.id_request)}
                    disabled={isApproving || isRejecting}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isApproving ? "Aprobando..." : "Aprobar"}
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      <RejectModal
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        submitting={action.kind === "reject"}
      />
    </>
  )
}
