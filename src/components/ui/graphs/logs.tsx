"use client"

import { useEffect, useState } from "react"
import { getMyNotifications, type NotificationRecord } from "@/services/notificationService"
import { useAuth } from "@/hooks/useAuth"

export interface Log {
  id: string
  title: string
  category: string
  timeAgo: string
  message: string
}

const CATEGORY_LABELS: Record<string, string> = {
  project_created: "Proyecto",
  project_completed: "Proyecto",
  project_member_added: "Proyecto",
  task_assigned: "Tarea",
  task_commented: "Actividad",
  task_overdue: "Vencimiento",
  admin_user_created: "Admin",
  admin_user_updated: "Admin",
  admin_user_deleted: "Admin",
  profile_change_requested: "Perfil",
  profile_change_approved: "Perfil",
  profile_change_rejected: "Perfil",
  profile_change_cancelled: "Perfil",
}

function getTimeAgo(dateValue: string): string {
  const diffMs = Date.now() - new Date(dateValue).getTime()
  if (Number.isNaN(diffMs)) return ""

  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return "Ahora mismo"
  if (mins < 60) return `Hace ${mins} min`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`

  return `Hace ${Math.floor(hours / 24)} d`
}

function notificationToLog(n: NotificationRecord): Log {
  return {
    id: n.id_notification,
    title: n.title,
    message: n.message,
    category: CATEGORY_LABELS[n.category] ?? "Sistema",
    timeAgo: getTimeAgo(n.createdAt),
  }
}

interface LogsFeedProps {
  logs?: Log[]
}

export default function LogsFeed({ logs: staticLogs }: LogsFeedProps) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<Log[]>(staticLogs ?? [])
  const [isLoading, setIsLoading] = useState(!staticLogs)

  useEffect(() => {
    if (staticLogs) return

    let cancelled = false

    async function load() {
      if (!user?.id) { setLogs([]); setIsLoading(false); return }

      setIsLoading(true)
      try {
        const data = await getMyNotifications(30)
        if (!cancelled) setLogs((data.notifications ?? []).map(notificationToLog))
      } catch {
        if (!cancelled) setLogs([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    const interval = window.setInterval(() => void load(), 60_000)
    return () => { cancelled = true; window.clearInterval(interval) }
  }, [user?.id, staticLogs])

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-zinc-200 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-900">Logs</h2>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-zinc-100" />
                <div className="h-2.5 w-1/2 rounded bg-zinc-100" />
                <div className="h-2.5 w-1/3 rounded bg-zinc-100" />
              </div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No hay actividad reciente.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-zinc-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">{log.title}</p>
                {log.message ? (
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-4">{log.message}</p>
                ) : null}
                <p className="text-[11px] text-zinc-400 mt-0.5">{log.category} · {log.timeAgo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}