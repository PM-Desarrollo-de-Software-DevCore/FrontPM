"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CheckCircle2, AlertTriangle, Trash2 } from "lucide-react"

import {
  ProgressEntry,
  ProgressEntryType,
  createProjectProgressEntry,
  deleteProgressEntry,
  getProjectProgressEntries,
} from "@/services/progressEntriesService"
import {
  BackendSprint,
  getProjectSprints,
} from "@/services/milestonesService"
import { getProjects } from "@/services/projectService"
import { slugify } from "@/lib/slug"
import { useAuth } from "@/hooks/useAuth"

type FilterValue = "all" | ProgressEntryType

function formatDateTime(iso: string): string {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ProjectProgressEntriesPage() {
  const params = useParams()
  const routeProjectId = params.projectId as string
  const { user } = useAuth()

  const [resolvedProject, setResolvedProject] = useState<{ id: string; name: string } | null>(null)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [resolvingProject, setResolvingProject] = useState(true)

  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [sprints, setSprints] = useState<BackendSprint[]>([])
  const [filter, setFilter] = useState<FilterValue>("all")
  const [sprintFilter, setSprintFilter] = useState<string>("")

  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [type, setType] = useState<ProgressEntryType>("progress")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [sprintId, setSprintId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const projectId = resolvedProject?.id ?? null

  useEffect(() => {
    let isMounted = true

    const resolve = async () => {
      setResolvingProject(true)
      setProjectError(null)

      try {
        const projects = await getProjects()
        const match = projects.find(
          (project) => project.id === routeProjectId || slugify(project.name) === routeProjectId
        )

        if (!isMounted) return

        if (!match) {
          setProjectError("No se encontró el proyecto solicitado.")
          setResolvedProject(null)
          return
        }

        setResolvedProject({ id: match.id, name: match.name })
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "No se pudo resolver el proyecto."
        setProjectError(message)
        setResolvedProject(null)
      } finally {
        if (isMounted) setResolvingProject(false)
      }
    }

    resolve()

    return () => {
      isMounted = false
    }
  }, [routeProjectId])

  const loadEntries = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setListError(null)

    try {
      const data = await getProjectProgressEntries(projectId, {
        type: filter === "all" ? undefined : filter,
        sprintId: sprintFilter || undefined,
      })

      setEntries(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar los registros."
      setListError(message)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [projectId, filter, sprintFilter])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    if (!projectId) return
    let isMounted = true

    const loadSprints = async () => {
      try {
        const data = await getProjectSprints(projectId)
        if (isMounted) {
          setSprints(data)
        }
      } catch (error) {
        console.error("Error cargando sprints del proyecto:", error)
        if (isMounted) {
          setSprints([])
        }
      }
    }

    loadSprints()

    return () => {
      isMounted = false
    }
  }, [projectId])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!projectId) return

    const trimmed = description.trim()
    if (!trimmed) {
      setSubmitError("La descripción es obligatoria.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await createProjectProgressEntry(projectId, {
        type,
        description: trimmed,
        date: date ? new Date(date).toISOString() : undefined,
        id_sprint: sprintId || null,
      })

      setDescription("")
      setDate("")
      setSprintId("")
      setType("progress")
      await loadEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar."
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("¿Eliminar este registro?")
      if (!confirmed) return
    }

    setDeletingId(entryId)

    try {
      await deleteProgressEntry(entryId)
      setEntries((prev) => prev.filter((entry) => entry.id_entry !== entryId))
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el registro."
      setListError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const sprintNameById = useMemo(() => {
    return sprints.reduce<Record<string, string>>((acc, sprint) => {
      acc[sprint.id_sprint] = sprint.name
      return acc
    }, {})
  }, [sprints])

  const counts = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.total += 1
        if (entry.type === "progress") acc.progress += 1
        else acc.blockers += 1
        return acc
      },
      { total: 0, progress: 0, blockers: 0 }
    )
  }, [entries])

  if (resolvingProject) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-8 py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-slate-900" />
      </div>
    )
  }

  if (projectError || !resolvedProject) {
    return (
      <div className="min-h-screen w-full px-8 py-8">
        <Link
          href="/projects"
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Projects
        </Link>
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {projectError ?? "No se encontró el proyecto solicitado."}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full px-8 py-8">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Projects
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Progress &amp; Blockers</h1>
            <p className="mt-1 text-sm text-slate-500">
              {resolvedProject.name} · Registra avances y bloqueadores. La lista se ordena del más reciente al más antiguo.
            </p>
          </div>

          <Link
            href={`/projects/${routeProjectId}/tasks`}
            className="rounded-2xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md"
          >
            View Tasks
          </Link>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total" value={counts.total} tone="neutral" />
        <SummaryCard label="Avances" value={counts.progress} tone="progress" />
        <SummaryCard label="Bloqueadores" value={counts.blockers} tone="blocker" />
      </section>

      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Nuevo registro</h2>
        <p className="mb-4 text-xs text-slate-500">
          Reporta un avance del proyecto o un bloqueador que esté afectando el progreso.
        </p>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Tipo</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as ProgressEntryType)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="progress">Avance</option>
                <option value="blocker">Bloqueador</option>
              </select>
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Fecha (opcional)</span>
              <input
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Sprint (opcional)</span>
              <select
                value={sprintId}
                onChange={(event) => setSprintId(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">Sin sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id_sprint} value={sprint.id_sprint}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Descripción</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Ej: Se integró el login con JWT / Bloqueado por accesos a Azure"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Guardando..." : "Agregar registro"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Historial</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-xs font-medium text-slate-600">
              {(["all", "progress", "blocker"] as FilterValue[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 transition ${
                    filter === value
                      ? "bg-slate-900 text-white"
                      : "hover:bg-zinc-100"
                  }`}
                >
                  {value === "all"
                    ? "Todos"
                    : value === "progress"
                    ? "Avances"
                    : "Bloqueadores"}
                </button>
              ))}
            </div>

            <select
              value={sprintFilter}
              onChange={(event) => setSprintFilter(event.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="">Todos los sprints</option>
              {sprints.map((sprint) => (
                <option key={sprint.id_sprint} value={sprint.id_sprint}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {listError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-slate-900" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Aún no hay registros para este filtro.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const canDelete = user?.id === entry.createdBy
              const isDeleting = deletingId === entry.id_entry
              const sprintName = entry.id_sprint ? sprintNameById[entry.id_sprint] : null

              return (
                <li
                  key={entry.id_entry}
                  className={`flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between ${
                    entry.type === "progress"
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${
                        entry.type === "progress"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                      aria-hidden
                    >
                      {entry.type === "progress" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            entry.type === "progress"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {entry.type === "progress" ? "Avance" : "Bloqueador"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(entry.date)}
                        </span>
                        {sprintName && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Sprint · {sprintName}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                        {entry.description}
                      </p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id_entry)}
                      disabled={isDeleting}
                      className="self-start rounded-md border border-transparent p-1.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Eliminar registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: number
  tone: "neutral" | "progress" | "blocker"
}

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const toneClasses =
    tone === "progress"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "blocker"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-zinc-200 bg-white text-slate-700"

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
