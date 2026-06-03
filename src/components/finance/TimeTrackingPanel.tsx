"use client"

import { useCallback, useEffect, useState } from "react"

import { ProjectTimeSummary } from "@/types/finance"
import { Task } from "@/types/task"
import { createTimeEntry, getProjectTimeSummary } from "@/services/timeEntryService"
import { getProjectMembers } from "@/services/userService"
import { getProjectTasks } from "@/services/taskService"
import { getToken } from "@/lib/auth"
import { formatNumber } from "@/lib/utils"
import dynamic from "next/dynamic"
const HoursBarChart = dynamic(() => import("@/components/ui/graphs/HoursBarChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[200px] animate-pulse rounded-xl bg-slate-100" />,
})

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

export default function TimeTrackingPanel({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<ProjectTimeSummary | null>(null)
  const [names, setNames] = useState<Record<string, string>>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [taskId, setTaskId] = useState("")
  const [hours, setHours] = useState("")
  const [workDate, setWorkDate] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk, setSubmitOk] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getToken() || ""
      const [timeSummary, users, taskList] = await Promise.all([
        getProjectTimeSummary(projectId),
        getProjectMembers(projectId).catch(() => []),
        getProjectTasks(projectId, token).catch(() => [] as Task[]),
      ])

      const nameMap: Record<string, string> = {}
      users.forEach((user) => {
        nameMap[user.id] = `${user.name ?? ""} ${user.lastname ?? ""}`.trim()
      })

      setSummary(timeSummary)
      setNames(nameMap)
      setTasks(taskList)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el resumen de horas.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const taskTitle = (id: string) => tasks.find((task) => task.id === id)?.title || id

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitOk(false)

    if (!taskId) {
      setSubmitError("Selecciona una tarea.")
      return
    }

    const parsedHours = Number(hours)
    if (!hours || Number.isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
      setSubmitError("Las horas deben estar entre 0 y 24.")
      return
    }

    if (!workDate) {
      setSubmitError("Selecciona la fecha.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await createTimeEntry(taskId, {
        hours: parsedHours,
        work_date: workDate,
        description: description.trim() || undefined,
      })

      setHours("")
      setDescription("")
      setSubmitOk(true)
      await load()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudieron registrar las horas.")
    } finally {
      setSubmitting(false)
    }
  }

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

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard label="Horas totales" value={formatNumber(summary.totalHours)} />
        <StatCard label="Registros" value={formatNumber(summary.entryCount, "0", 0)} />
      </section>

      {/* Gráficas */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Horas por usuario</h3>
          <div className="h-64">
            <HoursBarChart
              labels={summary.byUser.map((bucket) => names[bucket.id] || bucket.id)}
              values={summary.byUser.map((bucket) => bucket.hours)}
              color="#6366f1"
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Horas por tarea</h3>
          <div className="h-64">
            <HoursBarChart
              labels={summary.byTask.map((bucket) => taskTitle(bucket.id))}
              values={summary.byTask.map((bucket) => bucket.hours)}
              color="#10b981"
            />
          </div>
        </div>
      </section>

      {/* Alta de horas */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Registrar horas</h3>
        <p className="mb-4 text-xs text-slate-500">Registra tus horas trabajadas en una tarea del proyecto.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 font-medium">Tarea</span>
              <select
                value={taskId}
                onChange={(event) => setTaskId(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">Selecciona una tarea</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Horas (0–24)</span>
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Fecha</span>
              <input
                type="date"
                value={workDate}
                onChange={(event) => setWorkDate(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 font-medium">Descripción (opcional)</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ej: Implementación del endpoint de login"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          {submitOk && <p className="text-sm text-emerald-600">Horas registradas correctamente.</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
