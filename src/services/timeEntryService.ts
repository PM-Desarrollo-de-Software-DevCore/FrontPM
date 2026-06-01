/**
 * Time tracking: registro de horas por tarea y resumen por proyecto.
 * Contrato: docs/finanzas-frontend.md sección 5.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"
import { ProjectTimeSummary, TimeEntry } from "@/types/finance"

export interface TimeEntryPayload {
  hours: number
  work_date: string
  description?: string
}

/** GET /projects/:id/time-summary — totales + agregados byUser/byTask. */
export function getProjectTimeSummary(projectId: string): Promise<ProjectTimeSummary> {
  return apiGet<ProjectTimeSummary>(
    `/projects/${projectId}/time-summary`,
    "No se pudo obtener el resumen de horas."
  )
}

/** GET /tasks/:taskId/time-entries — registros de una tarea. */
export function getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
  return apiGet<TimeEntry[]>(
    `/tasks/${taskId}/time-entries`,
    "No se pudieron obtener los registros de horas."
  )
}

/** POST /tasks/:taskId/time-entries — registra horas (cada quien las suyas; admin cualquiera). */
export function createTimeEntry(taskId: string, payload: TimeEntryPayload): Promise<TimeEntry> {
  return apiPost<TimeEntry>(
    `/tasks/${taskId}/time-entries`,
    payload,
    "No se pudieron registrar las horas."
  )
}

/** PATCH /time-entries/:id */
export function updateTimeEntry(entryId: string, payload: Partial<TimeEntryPayload>): Promise<TimeEntry> {
  return apiPatch<TimeEntry>(
    `/time-entries/${entryId}`,
    payload,
    "No se pudo actualizar el registro de horas."
  )
}

/** DELETE /time-entries/:id */
export function deleteTimeEntry(entryId: string): Promise<void> {
  return apiDelete(`/time-entries/${entryId}`, "No se pudo eliminar el registro de horas.")
}
