"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"

import { FinancialSummary } from "@/types/finance"
import { getFinancialSummary } from "@/services/financeSummaryService"
import { formatMoney, formatNumber } from "@/lib/utils"
import GaugeChart from "@/components/ui/graphs/GaugeChart"
import BurnChart from "@/components/ui/graphs/BurnChart"

const BILLING_LABELS: Record<string, string> = {
  fixed_price: "Precio fijo",
  retainer: "Honorarios mensuales",
  time_and_materials: "Tiempo y materiales",
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

export default function FinancialSummaryPanel({ projectId }: { projectId: string }) {
  const [data, setData] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const summary = await getFinancialSummary(projectId)
        if (active) setData(summary)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el resumen financiero.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [projectId])

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

  const billingLabel = data.billingModel
    ? BILLING_LABELS[data.billingModel] ?? data.billingModel
    : "N/A"

  const overBudget = data.projectedOverBudget !== null && data.projectedOverBudget > 0

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Presupuesto" value={formatMoney(data.budget)} />
        <KpiCard label="Costo mensual" value={formatMoney(data.monthlyCost)} />
        <KpiCard label="Modelo de facturación" value={billingLabel} />
      </section>

      {/* Gauges */}
      <section className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <GaugeChart value={data.budgetConsumedRatio} label="Presupuesto consumido" />
        <GaugeChart value={data.timeProgressRatio} label="Tiempo transcurrido" warnAt={1.1} dangerAt={1.2} />
      </section>

      {/* Semáforos */}
      <section className="flex flex-wrap gap-3">
        {data.budgetCoversPlannedEnd === true && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> El presupuesto alcanza la fecha fin
          </span>
        )}
        {data.budgetCoversPlannedEnd === false && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" /> El presupuesto no alcanza la fecha fin
          </span>
        )}
        {overBudget && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Sobrecosto proyectado: {formatMoney(data.projectedOverBudget)}
          </span>
        )}
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Gasto estimado" value={formatMoney(data.estimatedSpend)} hint="Proxy: costo mensual × meses" />
        <KpiCard label="Presupuesto restante" value={formatMoney(data.remainingBudget)} />
        <KpiCard label="Runway" value={data.runwayMonths !== null ? `${formatNumber(data.runwayMonths)} meses` : "N/A"} />
        <KpiCard label="Costo por story point" value={formatMoney(data.costPerStoryPoint)} />
        <KpiCard label="Costo por sprint estimado" value={formatMoney(data.costPerEstimatedSprint)} />
      </section>

      {/* Burn */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Burn acumulado</h3>
        <BurnChart burnSeries={data.burnSeries ?? []} budget={data.budget} />
      </section>

      {/* Notas */}
      {data.notes && data.notes.length > 0 && (
        <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
            <ul className="space-y-1 text-xs text-blue-800">
              {data.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
