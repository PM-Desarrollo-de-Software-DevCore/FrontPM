/**
 * Servicio de analítica financiera de proyecto (solo lectura).
 * Contrato: docs/finanzas-frontend.md secciones 1 (financial-summary) y 2 (evm).
 */

import { apiGet } from "@/lib/api"
import { EvmData, FinancialPortfolio, FinancialSummary } from "@/types/finance"

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

/** GET /dashboard/financial-portfolio — agrega todos los proyectos del usuario. */
export function getFinancialPortfolio(): Promise<FinancialPortfolio> {
  return apiGet<FinancialPortfolio>(
    `/dashboard/financial-portfolio`,
    "No se pudo obtener el portafolio financiero."
  )
}
