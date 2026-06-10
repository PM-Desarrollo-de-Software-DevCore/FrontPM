"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined"
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { useAuth } from "@/hooks/useAuth"
import { getMyNotifications, markAllNotificationsAsRead, NotificationRecord } from "@/services/notificationService"

const CATEGORY_LABELS: Record<string, string> = {
  project_created: "Proyecto",
  project_completed: "Proyecto finalizado",
  project_updated: "Proyecto actualizado",
  project_deleted: "Proyecto eliminado",
  project_member_added: "Proyecto",
  task_assigned: "Tarea",
  task_commented: "Comentario",
  task_overdue: "Vencimiento",
  task_due_soon: "Por vencer",
  task_completed: "Tarea completada",
  sprint_completed: "Sprint completado",
  admin_user_created: "Admin",
  admin_user_updated: "Admin",
  admin_user_deleted: "Admin",
  profile_change_requested: "Perfil · solicitud",
  profile_change_approved: "Perfil · aprobada",
  profile_change_rejected: "Perfil · rechazada",
  profile_change_cancelled: "Perfil · cancelada",
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatNotificationDate(dateValue: string) {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date)
}

function NotificationRow({ notification }: { notification: NotificationRecord }) {
  const isUnread = notification.readAt === null

  return (
    <article
      className={`rounded-2xl border px-3 py-3 transition ${isUnread ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white"}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isUnread ? "bg-rose-500" : "bg-slate-300"}`}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{notification.title}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {CATEGORY_LABELS[notification.category] || "Notificación"}
              </p>
            </div>

            {isUnread ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-700">
                Nueva
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-700">{notification.message}</p>

          <p className="mt-2 text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</p>
        </div>
      </div>
    </article>
  )
}

export default function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const icon = useMemo(() => {
    return unreadCount > 0 ? NotificationsActiveOutlinedIcon : NotificationsNoneOutlinedIcon
  }, [unreadCount])

  const loadNotifications = async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const data = await getMyNotifications(30)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()

    const interval = window.setInterval(() => {
      void loadNotifications()
    }, 60000)

    return () => {
      window.clearInterval(interval)
    }
    // Solo debe re-ejecutarse al cambiar de usuario; loadNotifications se
    // recrea en cada render y no puede ir en las dependencias sin causar loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        setIsModalOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isOpen) return
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener("mousedown", handleOutsideClick)

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  const handleToggle = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen && unreadCount > 0) {
      const now = new Date().toISOString()
      setUnreadCount(0)
      setNotifications((current) =>
        current.map((notification) =>
          notification.readAt === null
            ? { ...notification, readAt: now }
            : notification
        )
      )
      await markAllNotificationsAsRead().catch((error) => {
        console.error("Error marking notifications as read:", error)
      })
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setIsOpen(false)
  }

  const NotificationIcon = icon

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-sidebar-border bg-background text-sidebar-foreground transition hover:bg-sidebar-accent"
        aria-label="Abrir notificaciones"
        aria-expanded={isOpen}
      >
        <NotificationIcon className="h-5 w-5" />

        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,24rem)] rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              <p className="text-xs text-slate-500">
                {isLoading ? "Actualizando..." : `${unreadCount} sin leer`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar notificaciones"
            >
              <CloseRoundedIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto px-3 py-3">
            {notifications.length > 0 ? (
              <div className="flex flex-col gap-2">
                {notifications.slice(0, 6).map((notification) => (
                  <NotificationRow key={notification.id_notification} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-center text-sm text-slate-500">
                No tienes notificaciones nuevas.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={handleOpenModal}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Mostrar más
            </button>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-[min(94vw,52rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-base font-semibold text-slate-900">Notificaciones extendidas</p>
                <p className="text-sm text-slate-500">
                  Historial completo con fecha y hora.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar modal"
              >
                <CloseRoundedIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto bg-slate-50 px-4 py-4">
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {notifications.map((notification) => (
                    <NotificationRow key={notification.id_notification} notification={notification} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-44 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-4 text-sm text-slate-500">
                  No hay notificaciones para mostrar.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}