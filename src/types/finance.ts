/**
 * Tipos del módulo de Finanzas (contrato del backend BackPM).
 * Ver docs/finanzas-frontend.md. Muchos campos derivados llegan `null`
 * cuando faltan datos de entrada (sin presupuesto, sin fecha fin, etc.).
 */

export type BillingModel = "fixed_price" | "retainer" | "time_and_materials" | string

/** Punto de la serie de burn acumulado. */
export interface BurnPoint {
  month: string // "YYYY-MM"
  cumulativeEstimatedCost: number
}

/** GET /projects/:id/financial-summary */
export interface FinancialSummary {
  budget: number | null
  monthlyCost: number | null
  billingModel: BillingModel | null
  /** 0..1+ — % de presupuesto consumido. */
  budgetConsumedRatio: number | null
  /** 0..1 — % de tiempo transcurrido. */
  timeProgressRatio: number | null
  estimatedSpend: number | null
  remainingBudget: number | null
  runwayMonths: number | null
  budgetCoversPlannedEnd: boolean | null
  projectedOverBudget: number | null
  costPerStoryPoint: number | null
  costPerEstimatedSprint: number | null
  burnSeries: BurnPoint[]
  /** Qué se pudo calcular; claves variables según el backend. */
  dataAvailability: Record<string, boolean>
  notes: string[]
}

/** Fuente del Actual Cost en EVM; indica la confiabilidad del CPI/EAC. */
export type AcSource = "logged_hours" | "member_rates" | "project_monthly_cost"

/** Punto de la curva-S de EVM. `ev`/`ac` son `null` en meses futuros. */
export interface EvmSeriesPoint {
  month: string // "YYYY-MM"
  pv: number | null
  ev: number | null
  ac: number | null
}

export interface EvmDataAvailability {
  hasBudget: boolean
  hasSchedule: boolean
  hasProgressMeasure: boolean
  hasActualCost: boolean
}

/** GET /projects/:id/evm */
export interface EvmData {
  budget: number | null
  statusDate: string | null
  plannedValue: number | null
  earnedValue: number | null
  actualCost: number | null
  scheduleVariance: number | null
  costVariance: number | null
  schedulePerformanceIndex: number | null
  costPerformanceIndex: number | null
  estimateAtCompletion: number | null
  varianceAtCompletion: number | null
  acSource: AcSource | null
  laborCost: number | null
  expensesTotal: number | null
  loggedHours: number | null
  acMonthlyCost: number | null
  series: EvmSeriesPoint[]
  dataAvailability: EvmDataAvailability
  notes: string[]
}
