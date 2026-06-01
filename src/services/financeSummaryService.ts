/**
 * Servicio de analítica financiera de proyecto (solo lectura).
 * Contrato: docs/finanzas-frontend.md secciones 1 (financial-summary) y 2 (evm).
 */

import { apiGet } from "@/lib/api"
import { EvmData, FinancialSummary } from "@/types/finance"

/** GET /projects/:id/financial-summary — KPIs base + serie de burn. */
export function getFinancialSummary(projectId: string): Promise<FinancialSummary> {
  return apiGet<FinancialSummary>(
    `/projects/${projectId}/financial-summary`,
    "No se pudo obtener el resumen financiero del proyecto."
  )
}

/** GET /projects/:id/evm — Earned Value (PV/EV/AC, SPI/CPI, EAC...). */
export function getProjectEvm(projectId: string): Promise<EvmData> {
  return apiGet<EvmData>(
    `/projects/${projectId}/evm`,
    "No se pudo obtener el análisis EVM del proyecto."
  )
}
