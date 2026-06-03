"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Expense, ExpenseCategory } from "@/types/finance"
import { deleteExpense, getProjectExpenses } from "@/services/expenseService"
import { useProjectRole } from "@/hooks/useProjectRole"
import { formatDate, formatMoney } from "@/lib/utils"
import dynamic from "next/dynamic"
const CategoryDonut = dynamic(() => import("@/components/ui/graphs/CategoryDonut"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[200px] animate-pulse rounded-xl bg-slate-100" />,
})
import ExpenseFormModal from "@/components/finance/ExpenseFormModal"

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  software: "Software",
  infrastructure: "Infraestructura",
  services: "Servicios",
  travel: "Viajes",
  other: "Otros",
}

export default function ExpensesPanel({ projectId }: { projectId: string }) {
  const { canManageFinance } = useProjectRole(projectId)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setExpenses(await getProjectExpenses(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los gastos.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (expenseId: string) => {
    if (typeof window !== "undefined" && !window.confirm("¿Eliminar este gasto?")) return
    setDeletingId(expenseId)
    try {
      await deleteExpense(expenseId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el gasto.")
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

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const byCategory = new Map<ExpenseCategory, number>()
  expenses.forEach((expense) => {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount)
  })
  const donutLabels = Array.from(byCategory.keys()).map((category) => CATEGORY_LABELS[category] ?? category)
  const donutValues = Array.from(byCategory.values())

  const colSpan = canManageFinance ? 5 : 4

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total de gastos</p>
          <p className="text-2xl font-bold text-slate-800">{formatMoney(total)}</p>
        </div>
        {canManageFinance && (
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Agregar gasto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Por categoría</h3>
          <div className="h-64">
            <CategoryDonut labels={donutLabels} values={donutValues} emptyLabel="Sin gastos registrados." />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-4 lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-right">Monto</th>
                  {canManageFinance && <th className="px-3 py-2 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="px-3 py-8 text-center text-slate-400">
                      No hay gastos registrados.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id_expense} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-3 py-2 text-slate-500">{formatDate(expense.date)}</td>
                      <td className="px-3 py-2">{CATEGORY_LABELS[expense.category] ?? expense.category}</td>
                      <td className="px-3 py-2 text-slate-600">{expense.description || "—"}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-800">
                        {formatMoney(expense.amount)}
                      </td>
                      {canManageFinance && (
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(expense)
                                setModalOpen(true)
                              }}
                              aria-label="Editar gasto"
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(expense.id_expense)}
                              disabled={deletingId === expense.id_expense}
                              aria-label="Eliminar gasto"
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
      </div>

      {modalOpen && (
        <ExpenseFormModal
          projectId={projectId}
          expense={editing}
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
