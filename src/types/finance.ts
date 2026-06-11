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

/** Totales del portafolio del usuario (creador o miembro). */
export interface PortfolioSummary {
  totalProjects: number
  projectsWithBudget: number
  projectsAtRisk: number
  totalBudget: number
  totalEstimatedSpend: number
  totalRemaining: number
  totalProjectedOverBudget: number
}

/** Fila por proyecto en el portafolio. */
export interface PortfolioProject {
  id_project: string
  name: string
  status: string
  budget: number | null
  monthlyCost: number | null
  estimatedSpend: number | null
  remainingBudget: number | null
  budgetConsumedRatio: number | null
  runwayMonths: number | null
  budgetCoversPlannedEnd: boolean | null
  projectedOverBudget: number | null
  atRisk: boolean
}

/** GET /dashboard/financial-portfolio */
export interface FinancialPortfolio {
  summary: PortfolioSummary
  projects: PortfolioProject[]
}

/** Rol dentro de un proyecto (incluye team_lead). */
export type ProjectMemberRole = "project_manager" | "scrum_master" | "developer" | "team_lead"

/** Miembro de proyecto con datos financieros. `monthly_rate` (costo) y `sale_rate` (venta) llegan null si no autorizado a verlos. */
export interface ProjectMemberFinance {
  id_mp: string
  id_user: string
  id_project: string
  role: ProjectMemberRole
  fte: number | null
  monthly_rate: number | null
  sale_rate: number | null
  createdAt: string
}

/** Registro de horas en una tarea. */
export interface TimeEntry {
  id_time_entry: string
  id_task: string
  id_user: string
  id_project: string
  hours: number
  work_date: string
  description: string | null
  createdAt: string
}

/** Bucket de horas agregadas (por usuario o por tarea); `id` es el id de usuario/tarea. */
export interface TimeSummaryBucket {
  id: string
  hours: number
  entries: number
}

/** GET /projects/:id/time-summary */
export interface ProjectTimeSummary {
  totalHours: number
  entryCount: number
  byUser: TimeSummaryBucket[]
  byTask: TimeSummaryBucket[]
}

export type ExpenseCategory = "software" | "infrastructure" | "services" | "travel" | "other"

/** Gasto del proyecto. Contrato sección 6. */
export interface Expense {
  id_expense: string
  id_project: string
  amount: number
  category: ExpenseCategory
  description: string | null
  date: string
  createdBy: string
  createdAt: string
}

export type InvoiceStatus = "draft" | "sent" | "paid"

/** Factura del proyecto. Contrato sección 7. */
export interface Invoice {
  id_invoice: string
  id_project: string
  amount: number
  status: InvoiceStatus
  concept: string | null
  issue_date: string
  due_date: string | null
  period_start: string | null
  period_end: string | null
  id_milestone: string | null
  createdAt: string
}

/** Resumen de facturación devuelto por GET /projects/:id/invoices. */
export interface InvoiceSummary {
  invoiceCount: number
  totalDraft: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
  budget: number | null
  billedVsBudgetRatio: number | null
}

/** GET /projects/:id/invoices → { summary, invoices }. */
export interface InvoicesResponse {
  summary: InvoiceSummary
  invoices: Invoice[]
}

/** Línea del monto sugerido T&M: horas del miembro en el período × su tarifa de venta. */
export interface SuggestedInvoiceLine {
  userId: string
  hours: number
  sale_rate: number | null
  subtotal: number
}

/** GET /projects/:id/invoices/suggested-amount → preview del auto-cálculo T&M (no crea factura). */
export interface SuggestedInvoiceAmount {
  lines: SuggestedInvoiceLine[]
  total: number
  membersMissingRate: string[]
}
