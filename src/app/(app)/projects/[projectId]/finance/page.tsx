"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { getProjects } from "@/services/projectService"
import { slugify } from "@/lib/slug"
import FinancialSummaryPanel from "@/components/finance/FinancialSummaryPanel"
import EvmPanel from "@/components/finance/EvmPanel"
import ReportPanel from "@/components/finance/ReportPanel"
import TeamRatesPanel from "@/components/finance/TeamRatesPanel"
import TimeTrackingPanel from "@/components/finance/TimeTrackingPanel"
import ExpensesPanel from "@/components/finance/ExpensesPanel"
import InvoicesPanel from "@/components/finance/InvoicesPanel"

type FinanceTab = "summary" | "evm" | "team" | "hours" | "expenses" | "invoices" | "report"

const TABS: { key: FinanceTab; label: string }[] = [
  { key: "summary", label: "Resumen" },
  { key: "evm", label: "EVM" },
  { key: "team", label: "Equipo" },
  { key: "hours", label: "Horas" },
  { key: "expenses", label: "Gastos" },
  { key: "invoices", label: "Facturas" },
  { key: "report", label: "Reporte" },
]

export default function ProjectFinancePage() {
  const params = useParams()
  const routeProjectId = params.projectId as string

  const [resolvedProject, setResolvedProject] = useState<{
    id: string
    name: string
    billingModel: string | null
  } | null>(null)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(true)
  const [tab, setTab] = useState<FinanceTab>("summary")

  useEffect(() => {
    let active = true

    const resolve = async () => {
      setResolving(true)
      setProjectError(null)

      try {
        const projects = await getProjects()
        const match = projects.find(
          (project) => project.id === routeProjectId || slugify(project.name) === routeProjectId
        )

        if (!active) return

        if (!match) {
          setProjectError("No se encontró el proyecto solicitado.")
          setResolvedProject(null)
          return
        }

        setResolvedProject({ id: match.id, name: match.name, billingModel: match.billingModel ?? null })
      } catch (error) {
        if (!active) return
        setProjectError(error instanceof Error ? error.message : "No se pudo resolver el proyecto.")
        setResolvedProject(null)
      } finally {
        if (active) setResolving(false)
      }
    }

    resolve()

    return () => {
      active = false
    }
  }, [routeProjectId])

  if (resolving) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-8 py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-slate-900" />
      </div>
    )
  }

  if (projectError || !resolvedProject) {
    return (
      <div className="min-h-screen w-full px-8 py-8">
        <Link href="/projects" className="text-sm text-gray-500 transition hover:text-black">
          ← Back to Projects
        </Link>
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {projectError ?? "No se encontró el proyecto solicitado."}
        </div>
      </div>
    )
  }

  const projectId = resolvedProject.id

  return (
    <div className="min-h-screen w-full px-8 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-500 transition hover:text-black">
          ← Back to Projects
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Finanzas</h1>
            <p className="mt-1 text-sm text-slate-500">
              {resolvedProject.name} · KPIs financieros, EVM y reporte del proyecto.
            </p>
          </div>

          <Link
            href={`/projects/${routeProjectId}/tasks`}
            className="rounded-2xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md"
          >
            Ver tareas
          </Link>
        </div>
      </div>

      <div className="mb-6 inline-flex overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-sm font-medium text-slate-600">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 transition ${
              tab === item.key ? "bg-slate-900 text-white" : "hover:bg-zinc-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "summary" && <FinancialSummaryPanel projectId={projectId} />}
      {tab === "evm" && <EvmPanel projectId={projectId} />}
      {tab === "team" && <TeamRatesPanel projectId={projectId} />}
      {tab === "hours" && <TimeTrackingPanel projectId={projectId} />}
      {tab === "expenses" && <ExpensesPanel projectId={projectId} />}
      {tab === "invoices" && (
        <InvoicesPanel projectId={projectId} billingModel={resolvedProject.billingModel} />
      )}
      {tab === "report" && <ReportPanel projectId={projectId} />}
    </div>
  )
}
