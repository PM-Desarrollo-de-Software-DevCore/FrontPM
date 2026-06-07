"use client"

import { useEffect, useState } from "react"
import { getUnassignedTasks, type UnassignedTask } from "@/services/taskService"

interface UnassignedTasksProps {
  tasks?: UnassignedTask[]
}

export default function UnassignedTasks({ tasks: staticTasks }: UnassignedTasksProps) {
  const [tasks, setTasks] = useState<UnassignedTask[]>(staticTasks ?? [])
  const [isLoading, setIsLoading] = useState(!staticTasks)

  useEffect(() => {
    if (staticTasks) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const data = await getUnassignedTasks()
        if (!cancelled) setTasks(data)
      } catch {
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [staticTasks])

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-900">Tareas sin asignar</h2>
      </div>

       <div className="divide-y divide-zinc-200 h-[375px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-zinc-100" />
                <div className="h-2.5 w-1/3 rounded bg-zinc-100" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-6 text-xs text-zinc-400">
            No hay tareas sin asignar.
          </div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-zinc-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">{t.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t.project}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}