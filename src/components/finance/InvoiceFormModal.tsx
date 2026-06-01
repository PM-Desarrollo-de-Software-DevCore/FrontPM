"use client"

import { useState } from "react"

import { Invoice, InvoiceStatus } from "@/types/finance"
import { createInvoice, updateInvoice } from "@/services/invoiceService"

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "paid", label: "Pagada" },
]

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ""
}

type InvoiceFormModalProps = {
  projectId: string
  invoice: Invoice | null
  onClose: () => void
  onSaved: () => void
}

export default function InvoiceFormModal({ projectId, invoice, onClose, onSaved }: InvoiceFormModalProps) {
  const isEdit = Boolean(invoice)
  const [amount, setAmount] = useState(invoice ? String(invoice.amount) : "")
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft")
  const [concept, setConcept] = useState(invoice?.concept ?? "")
  const [issueDate, setIssueDate] = useState(toDateInput(invoice?.issue_date))
  const [dueDate, setDueDate] = useState(toDateInput(invoice?.due_date))
  const [periodStart, setPeriodStart] = useState(toDateInput(invoice?.period_start))
  const [periodEnd, setPeriodEnd] = useState(toDateInput(invoice?.period_end))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedAmount = Number(amount)
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Ingresa un monto válido.")
      return
    }

    if (!issueDate) {
      setError("Selecciona la fecha de emisión.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        amount: parsedAmount,
        status,
        concept: concept.trim() || undefined,
        issue_date: issueDate,
        due_date: dueDate || undefined,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
      }

      if (isEdit && invoice) {
        await updateInvoice(invoice.id_invoice, payload)
      } else {
        await createInvoice(projectId, payload)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la factura.")
      setSaving(false)
    }
  }

  const fieldClass =
    "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {isEdit ? "Editar factura" : "Nueva factura"}
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Monto</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Estado</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Concepto (opcional)</span>
            <input
              type="text"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Fecha de emisión</span>
              <input
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Vencimiento (opcional)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Inicio del período (opcional)</span>
              <input
                type="date"
                value={periodStart}
                onChange={(event) => setPeriodStart(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Fin del período (opcional)</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:shadow-sm disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
