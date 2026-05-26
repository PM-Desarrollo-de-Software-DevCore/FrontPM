"use client"

import { useEffect, useState } from "react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import CircularProgress from "@mui/material/CircularProgress"
import Tooltip from "@mui/material/Tooltip"

import { getProjectReportUrl } from "@/services/reportService"

interface Props {
  open: boolean
  projectId: string
  projectName: string
  onCloseAction: () => void
}

export default function ProjectReportModal({
  open,
  projectId,
  projectName,
  onCloseAction,
}: Props) {
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadReport = async () => {
    if (!projectId) {
      return
    }

    setReportUrl(null)
    setLoading(true)
    setErrorMessage("")

    try {
      const nextUrl = getProjectReportUrl(projectId)
      setReportUrl(nextUrl)
    } catch {
      setErrorMessage("No se pudo cargar el reporte")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setReportUrl(null)
      setErrorMessage("")
      setLoading(false)
      return
    }

    void loadReport()

    return () => {}
  }, [open, projectId])

  useEffect(() => {
    return () => {}
  }, [])

  const handleDownload = () => {
    const downloadUrl = getProjectReportUrl(projectId, true)

    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `${projectName || "project"}-report.pdf`
    link.click()
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[min(82vh,44rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project Report</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{projectName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip title="Regenerate PDF" arrow placement="top">
              <span>
                <button
                  type="button"
                  onClick={() => void loadReport()}
                  disabled={loading}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Regenerate PDF"
                >
                  <RestartAltIcon className="h-5 w-5" />
                </button>
              </span>
            </Tooltip>

            <Tooltip title="Download PDF" arrow placement="top">
              <span>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!reportUrl}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Download PDF"
                >
                  <DownloadIcon className="h-5 w-5" />
                </button>
              </span>
            </Tooltip>

            <Tooltip title="Close" arrow placement="top">
              <button
                type="button"
                onClick={onCloseAction}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                aria-label="Close report modal"
              >
                <CloseRoundedIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 p-4">
          {errorMessage ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-600">
              {errorMessage}
            </div>
          ) : reportUrl ? (
            <div className="relative h-full w-full">
              <iframe
                title="Project report preview"
                src={reportUrl}
                className="h-full w-full rounded-3xl border border-slate-200 bg-white"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                  setErrorMessage("No se pudo cargar el reporte")
                }}
              />

              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/90 text-center text-sm text-slate-500">
                  <CircularProgress size={24} thickness={4} />
                  <span>Regenerating report preview...</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500">
              No report available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}