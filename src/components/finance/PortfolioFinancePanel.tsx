"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { FinancialPortfolio } from "@/types/finance"
import { getFinancialPortfolio } from "@/services/financeSummaryService"
import { formatMoney, formatNumber, formatRatio } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  planning: "Planificación",
  in_progress: "En progreso",
  completed: "Completado",
  on_hold: "En pausa",
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "danger"
}) {
  const toneClasses =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-zinc-200 bg-white text-slate-800"

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function PortfolioFinancePanel() {
  const [data, setData] = useState<FinancialPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const portfolio = await getFinancialPortfolio()
        if (active) setData(portfolio)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el portafolio financiero.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

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

  if (!data) return null

  const { summary, projects } = data

  return (
    <div className="space-y-6">
      {/* KPIs del portafolio */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryStat label="Proyectos" value={formatNumber(summary.totalProjects, "0", 0)} />
        <SummaryStat label="Con presupuesto" value={formatNumber(summary.projectsWithBudget, "0", 0)} />
        <SummaryStat
          label="En riesgo"
          value={formatNumber(summary.projectsAtRisk, "0", 0)}
          tone={summary.projectsAtRisk > 0 ? "danger" : "neutral"}
        />
        <SummaryStat label="Presupuesto total" value={formatMoney(summary.totalBudget)} />
        <SummaryStat label="Gasto estimado total" value={formatMoney(summary.totalEstimatedSpend)} />
        <SummaryStat label="Restante total" value={formatMoney(summary.totalRemaining)} />
        <SummaryStat
          label="Sobrecosto proyectado"
          value={formatMoney(summary.totalProjectedOverBudget)}
          tone={summary.totalProjectedOverBudget > 0 ? "danger" : "neutral"}
        />
      </section>

      {/* Tabla de proyectos */}
      <section className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Proyecto</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Presupuesto</th>
                <th className="px-3 py-2 text-right">Gasto est.</th>
                <th className="px-3 py-2 text-right">Restante</th>
                <th className="px-3 py-2 text-right">Consumido</th>
                <th className="px-3 py-2 text-right">Runway</th>
                <th className="px-3 py-2 text-center">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                    No hay proyectos en tu portafolio.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id_project}
                    className={`border-b border-zinc-100 ${project.atRisk ? "bg-red-50/50" : "hover:bg-zinc-50"}`}
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/projects/${project.id_project}/finance`}
                        className="font-medium text-slate-800 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {STATUS_LABELS[project.status?.toLowerCase()] ?? project.status ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">{formatMoney(project.budget)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(project.estimatedSpend)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(project.remainingBudget)}</td>
                    <td className="px-3 py-2 text-right">{formatRatio(project.budgetConsumedRatio)}</td>
                    <td className="px-3 py-2 text-right">
                      {project.runwayMonths !== null ? `${formatNumber(project.runwayMonths)} m` : "N/A"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {project.atRisk ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                          <AlertTriangle className="h-3 w-3" /> Riesgo
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">OK</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
