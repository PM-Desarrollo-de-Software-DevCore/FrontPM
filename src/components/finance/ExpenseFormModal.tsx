"use client"

import { useState } from "react"

import { Expense, ExpenseCategory } from "@/types/finance"
import { createExpense, updateExpense } from "@/services/expenseService"

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "infrastructure", label: "Infraestructura" },
  { value: "services", label: "Servicios" },
  { value: "travel", label: "Viajes" },
  { value: "other", label: "Otros" },
]

type ExpenseFormModalProps = {
  projectId: string
  expense: Expense | null
  onClose: () => void
  onSaved: () => void
}

export default function ExpenseFormModal({ projectId, expense, onClose, onSaved }: ExpenseFormModalProps) {
  const isEdit = Boolean(expense)
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "")
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "software")
  const [description, setDescription] = useState(expense?.description ?? "")
  const [date, setDate] = useState(expense ? expense.date.slice(0, 10) : "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedAmount = Number(amount)
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Ingresa un monto válido.")
      return
    }

    if (!date) {
      setError("Selecciona la fecha.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        amount: parsedAmount,
        category,
        description: description.trim() || undefined,
        date,
      }

      if (isEdit && expense) {
        await updateExpense(expense.id_expense, payload)
      } else {
        await createExpense(projectId, payload)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el gasto.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {isEdit ? "Editar gasto" : "Nuevo gasto"}
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Monto</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Categoría</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-700">
            <span className="mb-1 font-medium">Descripción (opcional)</span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

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
