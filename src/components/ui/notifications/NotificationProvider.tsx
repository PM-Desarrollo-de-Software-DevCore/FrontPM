"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type NotificationType = "success" | "error"

type NotificationInput = {
  type: NotificationType
  title: string
  message?: string
}

type NotificationItem = NotificationInput & {
  id: string
  visible: boolean
}

type NotificationContextValue = {
  notify: (notification: NotificationInput) => void
  notifySuccess: (title: string, message?: string) => void
  notifyError: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const AUTO_DISMISS_MS = 3200
const ANIMATION_MS = 240

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, visible: false } : item))
    )

    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id))
    }, ANIMATION_MS)
  }, [])

  const notify = useCallback((notification: NotificationInput) => {
    const id = window.crypto.randomUUID()

    setNotifications((current) => [
      ...current,
      {
        ...notification,
        id,
        visible: false,
      },
    ])

    window.setTimeout(() => {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, visible: true } : item))
      )
    }, 20)

    window.setTimeout(() => {
      removeNotification(id)
    }, AUTO_DISMISS_MS)
  }, [removeNotification])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      notifySuccess: (title, message) => notify({ type: "success", title, message }),
      notifyError: (title, message) => notify({ type: "error", title, message }),
    }),
    [notify]
  )

  useEffect(() => {
    return () => {
      setNotifications([])
    }
  }, [])

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed top-3 right-3 z-9999 flex w-[min(92vw,22rem)] flex-col gap-2 sm:top-5 sm:right-5 sm:gap-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl transition-all duration-200 ease-out ${
              notification.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-3 opacity-0"
            } ${
              notification.type === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">{notification.title}</p>
                {notification.message ? (
                  <p className="mt-1 text-xs leading-5 opacity-90">{notification.message}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 text-sm font-semibold opacity-60 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }

  return context
}