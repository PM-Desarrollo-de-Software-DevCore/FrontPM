/**
 * Facturas del proyecto (CRUD). Contrato: docs/finanzas-frontend.md sección 7.
 * Ver = cualquier miembro; gestionar = admin o PM.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"
import { Invoice, InvoicesResponse, InvoiceStatus, SuggestedInvoiceAmount } from "@/types/finance"

export interface InvoicePayload {
  /** Omitir (no enviar null) para que el backend auto-calcule en proyectos T&M con período. */
  amount?: number
  status?: InvoiceStatus
  concept?: string
  issue_date: string
  due_date?: string
  period_start?: string
  period_end?: string
  id_milestone?: string
}

/** GET /projects/:id/invoices → { summary, invoices }. */
export function getProjectInvoices(projectId: string): Promise<InvoicesResponse> {
  return apiGet<InvoicesResponse>(`/projects/${projectId}/invoices`, "No se pudieron obtener las facturas.")
}

/** POST /projects/:id/invoices */
export function createInvoice(projectId: string, payload: InvoicePayload): Promise<Invoice> {
  return apiPost<Invoice>(`/projects/${projectId}/invoices`, payload, "No se pudo crear la factura.")
}

/** PATCH /invoices/:id */
export function updateInvoice(invoiceId: string, payload: Partial<InvoicePayload>): Promise<Invoice> {
  return apiPatch<Invoice>(`/invoices/${invoiceId}`, payload, "No se pudo actualizar la factura.")
}

/** DELETE /invoices/:id */
export function deleteInvoice(invoiceId: string): Promise<void> {
  return apiDelete(`/invoices/${invoiceId}`, "No se pudo eliminar la factura.")
}

/** GET /projects/:id/invoices/suggested-amount — preview T&M (horas × tarifa de venta), solo admin/PM. */
export function getSuggestedInvoiceAmount(
  projectId: string,
  periodStart: string,
  periodEnd: string
): Promise<SuggestedInvoiceAmount> {
  const query = new URLSearchParams({ period_start: periodStart, period_end: periodEnd })
  return apiGet<SuggestedInvoiceAmount>(
    `/projects/${projectId}/invoices/suggested-amount?${query.toString()}`,
    "No se pudo calcular el monto sugerido."
  )
}
