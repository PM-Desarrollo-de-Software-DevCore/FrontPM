"use client"

import { useEffect, useMemo, useState } from "react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

import {
  ProfileChangeFields,
  ProfileChangeRequest,
  createProfileChangeRequest,
} from "@/services/profileChangeRequestService"

interface CurrentProfile {
  name: string
  lastname: string
  email: string
  skill: string | null
  area: string | null
}

interface RequestModificationModalProps {
  open: boolean
  onClose: () => void
  current: CurrentProfile
  onCreated?: (request: ProfileChangeRequest) => void
}

type FormState = {
  name: string
  lastname: string
  email: string
  skill: string
  area: string
}

function buildInitialForm(current: CurrentProfile): FormState {
  return {
    name: current.name ?? "",
    lastname: current.lastname ?? "",
    email: current.email ?? "",
    skill: current.skill ?? "",
    area: current.area ?? "",
  }
}

function diffChanges(initial: FormState, next: FormState, current: CurrentProfile): ProfileChangeFields {
  const changes: ProfileChangeFields = {}

  const trimmedName = next.name.trim()
  if (trimmedName !== (current.name ?? "").trim()) {
    changes.name = trimmedName
  }

  const trimmedLastname = next.lastname.trim()
  if (trimmedLastname !== (current.lastname ?? "").trim()) {
    changes.lastname = trimmedLastname
  }

  const trimmedEmail = next.email.trim().toLowerCase()
  if (trimmedEmail !== (current.email ?? "").trim().toLowerCase()) {
    changes.email = trimmedEmail
  }

  const trimmedSkill = next.skill.trim()
  const currentSkill = (current.skill ?? "").trim()
  if (trimmedSkill !== currentSkill) {
    changes.skill = trimmedSkill === "" ? null : trimmedSkill
  }

  const trimmedArea = next.area.trim()
  const currentArea = (current.area ?? "").trim()
  if (trimmedArea !== currentArea) {
    changes.area = trimmedArea === "" ? null : trimmedArea
  }

  return changes
}

export default function RequestModificationModal({
  open,
  onClose,
  current,
  onCreated,
}: RequestModificationModalProps) {
  const initial = useMemo(() => buildInitialForm(current), [current])
  const [form, setForm] = useState<FormState>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial)
      setError(null)
    }
  }, [open, initial])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  const changes = useMemo(() => diffChanges(initial, form, current), [initial, form, current])
  const hasChanges = Object.keys(changes).length > 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasChanges) {
      setError("No has hecho ningún cambio.")
      return
    }

    if (changes.name !== undefined && !changes.name) {
      setError("El nombre no puede quedar vacío.")
      return
    }

    if (changes.lastname !== undefined && !changes.lastname) {
      setError("El apellido no puede quedar vacío.")
      return
    }

    if (changes.email !== undefined) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)
      if (!emailOk) {
        setError("El email no tiene un formato válido.")
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      const created = await createProfileChangeRequest(changes)
      onCreated?.(created)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la solicitud."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-[min(94vw,32rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Solicitar modificación de perfil</p>
            <p className="text-xs text-slate-500">
              Tus cambios entran a revisión por un administrador antes de aplicarse.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <CloseRoundedIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Nombre</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Apellido</span>
              <input
                type="text"
                value={form.lastname}
                onChange={(event) => setForm((prev) => ({ ...prev, lastname: event.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">
                Skill principal <span className="text-xs text-slate-400">(opcional)</span>
              </span>
              <input
                type="text"
                value={form.skill}
                placeholder="Ej: React"
                onChange={(event) => setForm((prev) => ({ ...prev, skill: event.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">
                Área <span className="text-xs text-slate-400">(opcional)</span>
              </span>
              <input
                type="text"
                value={form.area}
                placeholder="Ej: Frontend, QA"
                onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {hasChanges ? (
              <>
                <span className="font-semibold">Cambios pendientes:</span>{" "}
                {Object.keys(changes).join(", ")}
              </>
            ) : (
              "Edita uno o más campos para habilitar el envío."
            )}
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting || !hasChanges}
              className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
