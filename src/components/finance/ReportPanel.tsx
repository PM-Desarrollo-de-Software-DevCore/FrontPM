"use client"

import { useMemo, useState } from "react"
import { Download, RefreshCw } from "lucide-react"

import { getProjectReportUrl } from "@/services/reportService"

export default function ReportPanel({ projectId }: { projectId: string }) {
  const [reloadKey, setReloadKey] = useState(0)

  // URL estable por proyecto (evita recargar el iframe en cada render).
  // El refresco lo fuerza el `key={reloadKey}` del iframe, que lo remonta
  // y vuelve a pedir el PDF (el backend responde con Cache-Control: no-store).
  const inlineUrl = useMemo(() => getProjectReportUrl(projectId, false), [projectId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Reporte del proyecto</h3>
          <p className="text-sm text-slate-500">
            PDF generado por el backend, incluye la sección &quot;Financial Overview&quot;.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
          <a
            href={getProjectReportUrl(projectId, true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <Download className="h-4 w-4" /> Descargar PDF
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <iframe
          key={reloadKey}
          src={inlineUrl}
          title="Reporte del proyecto"
          className="h-[70vh] w-full"
        />
      </div>
    </div>
  )
}
