"use client"

import { useRef, useState } from "react"

import { Invoice, InvoiceStatus, SuggestedInvoiceAmount } from "@/types/finance"
import { createInvoice, getSuggestedInvoiceAmount, updateInvoice } from "@/services/invoiceService"
import { formatMoney } from "@/lib/utils"

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
  /** billing_model del proyecto; habilita el auto-cálculo/preview cuando es "time_and_materials". */
  billingModel?: string | null
  onClose: () => void
  onSaved: () => void
}

export default function InvoiceFormModal({
  projectId,
  invoice,
  billingModel,
  onClose,
  onSaved,
}: InvoiceFormModalProps) {
  const isEdit = Boolean(invoice)
  const isTimeAndMaterials = billingModel === "time_and_materials"
  const [amount, setAmount] = useState(invoice ? String(invoice.amount) : "")
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft")
  const [concept, setConcept] = useState(invoice?.concept ?? "")
  const [issueDate, setIssueDate] = useState(toDateInput(invoice?.issue_date))
  const [dueDate, setDueDate] = useState(toDateInput(invoice?.due_date))
  const [periodStart, setPeriodStart] = useState(toDateInput(invoice?.period_start))
  const [periodEnd, setPeriodEnd] = useState(toDateInput(invoice?.period_end))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestedInvoiceAmount | null>(null)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  // Invalida respuestas en vuelo cuando cambia el período (evita repoblar un preview obsoleto).
  const suggestSeqRef = useRef(0)

  const handleSuggest = async () => {
    if (!periodStart || !periodEnd) return

    const seq = ++suggestSeqRef.current
    setSuggesting(true)
    setSuggestError(null)

    try {
      const result = await getSuggestedInvoiceAmount(projectId, periodStart, periodEnd)
      if (seq !== suggestSeqRef.current) return
      setSuggestion(result)
    } catch (err) {
      if (seq !== suggestSeqRef.current) return
      setSuggestion(null)
      setSuggestError(err instanceof Error ? err.message : "No se pudo calcular el monto sugerido.")
    } finally {
      if (seq === suggestSeqRef.current) setSuggesting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // En T&M, crear sin monto delega el cálculo al backend (horas × tarifa de venta del período).
    const wantsAutoAmount = !isEdit && isTimeAndMaterials && amount.trim() === ""
    const parsedAmount = Number(amount)

    if (wantsAutoAmount && (!periodStart || !periodEnd)) {
      setError("Para auto-calcular el monto, selecciona inicio y fin del período.")
      return
    }

    if (!wantsAutoAmount && (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0)) {
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
        amount: wantsAutoAmount ? undefined : parsedAmount,
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
              {!isEdit && isTimeAndMaterials && (
                <span className="mt-1 text-xs text-slate-500">
                  Déjalo vacío para auto-calcular con las horas del período.
                </span>
              )}
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
                onChange={(event) => {
                  setPeriodStart(event.target.value)
                  suggestSeqRef.current++
                  setSuggestion(null)
                  setSuggestError(null)
                  setSuggesting(false)
                }}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col text-sm text-slate-700">
              <span className="mb-1 font-medium">Fin del período (opcional)</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(event) => {
                  setPeriodEnd(event.target.value)
                  suggestSeqRef.current++
                  setSuggestion(null)
                  setSuggestError(null)
                  setSuggesting(false)
                }}
                className={fieldClass}
              />
            </label>
          </div>

          {isTimeAndMaterials && (
            <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Monto sugerido (horas × tarifa de venta)</span>
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={suggesting || !periodStart || !periodEnd}
                  className="rounded-2xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggesting ? "Calculando..." : "Calcular"}
                </button>
              </div>

              {(!periodStart || !periodEnd) && (
                <p className="text-xs text-slate-500">Selecciona inicio y fin del período para calcular.</p>
              )}

              {suggestError && <p className="text-xs text-red-600">{suggestError}</p>}

              {suggestion && (
                <div className="space-y-2">
                  <p>
                    <span>Total sugerido:</span>{" "}
                    <span className="font-semibold">{formatMoney(suggestion.total)}</span>
                  </p>
                  {suggestion.membersMissingRate.length > 0 && (
                    <p className="text-xs text-amber-600">
                      <span>Miembros con horas sin tarifa de venta:</span>{" "}
                      <span>{suggestion.membersMissingRate.length}</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setAmount(String(suggestion.total))}
                    disabled={suggestion.total <= 0}
                    className="rounded-2xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Usar este monto
                  </button>
                </div>
              )}
            </div>
          )}

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
