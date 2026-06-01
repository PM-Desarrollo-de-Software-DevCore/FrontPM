/**
 * Gastos del proyecto (CRUD). Contrato: docs/finanzas-frontend.md sección 6.
 * Ver = cualquier miembro; gestionar = admin o PM.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"
import { Expense, ExpenseCategory } from "@/types/finance"

export interface ExpensePayload {
  amount: number
  category: ExpenseCategory
  description?: string
  date: string
}

/** GET /projects/:id/expenses */
export function getProjectExpenses(projectId: string): Promise<Expense[]> {
  return apiGet<Expense[]>(`/projects/${projectId}/expenses`, "No se pudieron obtener los gastos.")
}

/** POST /projects/:id/expenses */
export function createExpense(projectId: string, payload: ExpensePayload): Promise<Expense> {
  return apiPost<Expense>(`/projects/${projectId}/expenses`, payload, "No se pudo crear el gasto.")
}

/** PATCH /expenses/:id */
export function updateExpense(expenseId: string, payload: Partial<ExpensePayload>): Promise<Expense> {
  return apiPatch<Expense>(`/expenses/${expenseId}`, payload, "No se pudo actualizar el gasto.")
}

/** DELETE /expenses/:id */
export function deleteExpense(expenseId: string): Promise<void> {
  return apiDelete(`/expenses/${expenseId}`, "No se pudo eliminar el gasto.")
}
