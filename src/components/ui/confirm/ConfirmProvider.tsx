"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { AlertTriangle, HelpCircle } from "lucide-react"

type ConfirmTone = "danger" | "default"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
}

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

type DialogState = ConfirmOptions & { open: boolean }

const ANIMATION_MS = 200

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null)
  const [visible, setVisible] = useState(false)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((result: boolean) => {
    setVisible(false)
    resolverRef.current?.(result)
    resolverRef.current = null
    window.setTimeout(() => setState(null), ANIMATION_MS)
  }, [])

  const confirm = useCallback<ConfirmContextValue>((options) => {
    return new Promise<boolean>((resolve) => {
      // Resuelve cualquier diálogo previo aún abierto como cancelado.
      resolverRef.current?.(false)
      resolverRef.current = resolve
      setState({ ...options, open: true })
      window.requestAnimationFrame(() => setVisible(true))
    })
  }, [])

  useEffect(() => {
    if (!state?.open) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKey)
    }
  }, [state?.open, close])

  const isDanger = state?.tone === "danger"

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <div
          className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-200 ease-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => close(false)}
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className={`relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all duration-200 ease-out dark:border-white/10 dark:bg-slate-900 ${
              visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  isDanger
                    ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                    : "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                }`}
              >
                {isDanger ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <HelpCircle className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="confirm-dialog-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {state.title}
                </h2>
                {state.description && (
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-300">
                    {state.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-2xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-slate-800"
              >
                {state.cancelLabel || "Cancel"}
              </button>

              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                  isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-zinc-900 hover:bg-zinc-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                }`}
              >
                {state.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }

  return context
}
