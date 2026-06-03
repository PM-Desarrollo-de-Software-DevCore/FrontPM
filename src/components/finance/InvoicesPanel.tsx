"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Invoice, InvoiceStatus, InvoiceSummary } from "@/types/finance"
import { deleteInvoice, getProjectInvoices } from "@/services/invoiceService"
import { useProjectRole } from "@/hooks/useProjectRole"
import { formatDate, formatMoney } from "@/lib/utils"
import dynamic from "next/dynamic"
const GaugeChart = dynamic(() => import("@/components/ui/graphs/GaugeChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[200px] animate-pulse rounded-xl bg-slate-100" />,
})
import InvoiceFormModal from "@/components/finance/InvoiceFormModal"

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
}

const STATUS_TONE: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

export default function InvoicesPanel({ projectId }: { projectId: string }) {
  const { canManageFinance } = useProjectRole(projectId)
  const [summary, setSummary] = useState<InvoiceSummary | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getProjectInvoices(projectId)
      setSummary(response.summary)
      setInvoices(response.invoices)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las facturas.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (invoiceId: string) => {
    if (typeof window !== "undefined" && !window.confirm("¿Eliminar esta factura?")) return
    setDeletingId(invoiceId)
    try {
      await deleteInvoice(invoiceId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la factura.")
    } finally {
      setDeletingId(null)
    }
  }

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

  if (!summary) return null

  const colSpan = canManageFinance ? 5 : 4

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">Facturación</h3>
        {canManageFinance && (
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Agregar factura
          </button>
        )}
      </div>

      {/* KPIs + gauge */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard label="Borrador" value={formatMoney(summary.totalDraft)} />
          <StatCard label="Facturado" value={formatMoney(summary.totalBilled)} />
          <StatCard label="Pagado" value={formatMoney(summary.totalPaid)} />
          <StatCard label="Pendiente de cobro" value={formatMoney(summary.totalOutstanding)} />
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <GaugeChart value={summary.billedVsBudgetRatio} label="Facturado vs presupuesto" />
        </div>
      </section>

      {/* Tabla */}
      <section className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Emisión</th>
                <th className="px-3 py-2">Concepto</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Monto</th>
                {canManageFinance && <th className="px-3 py-2 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-3 py-8 text-center text-slate-400">
                    No hay facturas registradas.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id_invoice} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-3 py-2 text-slate-500">{formatDate(invoice.issue_date)}</td>
                    <td className="px-3 py-2 text-slate-600">{invoice.concept || "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[invoice.status]}`}
                      >
                        {STATUS_LABELS[invoice.status] ?? invoice.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">
                      {formatMoney(invoice.amount)}
                    </td>
                    {canManageFinance && (
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(invoice)
                              setModalOpen(true)
                            }}
                            aria-label="Editar factura"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(invoice.id_invoice)}
                            disabled={deletingId === invoice.id_invoice}
                            aria-label="Eliminar factura"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <InvoiceFormModal
          projectId={projectId}
          invoice={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            load()
          }}
        />
      )}
    </div>
  )
}
