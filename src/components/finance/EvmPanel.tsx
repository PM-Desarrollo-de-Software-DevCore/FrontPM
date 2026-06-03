"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"

import { AcSource, EvmData } from "@/types/finance"
import { getProjectEvm } from "@/services/financeSummaryService"
import { formatMoney, formatNumber } from "@/lib/utils"
import dynamic from "next/dynamic"
const EvmChart = dynamic(() => import("@/components/ui/graphs/EvmChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[200px] animate-pulse rounded-xl bg-slate-100" />,
})

const AC_SOURCE_LABELS: Record<AcSource, string> = {
  logged_hours: "Horas registradas (costo real)",
  member_rates: "Tarifas de miembros (indicativo)",
  project_monthly_cost: "Costo mensual del proyecto (indicativo)",
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

/** SPI/CPI: ≥1 es bueno (verde), <1 es malo (rojo). */
function IndexCard({ label, value }: { label: string; value: number | null }) {
  const tone =
    value === null
      ? "border-zinc-200 bg-white text-slate-800"
      : value >= 1
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700"

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold">{formatNumber(value, "N/A", 2)}</p>
    </div>
  )
}

export default function EvmPanel({ projectId }: { projectId: string }) {
  const [data, setData] = useState<EvmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const evm = await getProjectEvm(projectId)
        if (active) setData(evm)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el análisis EVM.")
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

  return (
    <div className="space-y-6">
      {/* Índices de desempeño */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <IndexCard label="SPI · Cronograma" value={data.schedulePerformanceIndex} />
        <IndexCard label="CPI · Costo" value={data.costPerformanceIndex} />
        <StatCard label="EAC · Estimado al cierre" value={formatMoney(data.estimateAtCompletion)} />
        <StatCard label="VAC · Variación al cierre" value={formatMoney(data.varianceAtCompletion)} />
      </section>

      {/* Valores base */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="PV · Planned Value" value={formatMoney(data.plannedValue)} />
        <StatCard label="EV · Earned Value" value={formatMoney(data.earnedValue)} />
        <StatCard label="AC · Actual Cost" value={formatMoney(data.actualCost)} />
        <StatCard label="Presupuesto" value={formatMoney(data.budget)} />
      </section>

      {/* Curva-S */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-800">Curva-S (PV / EV / AC)</h3>
          {data.acSource && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              AC: {AC_SOURCE_LABELS[data.acSource]}
            </span>
          )}
        </div>
        <EvmChart series={data.series ?? []} />
      </section>

      {/* Desglose del Actual Cost */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Costo de mano de obra" value={formatMoney(data.laborCost)} />
        <StatCard label="Gastos" value={formatMoney(data.expensesTotal)} />
        <StatCard label="Horas registradas" value={formatNumber(data.loggedHours)} />
        <StatCard label="Variación de costo (CV)" value={formatMoney(data.costVariance)} />
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
