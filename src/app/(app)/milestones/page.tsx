import type { MilestonesOverview } from "@/services/milestonesService"
import { serverFetch } from "@/lib/serverAuth"

import { buildMilestoneViews, type MilestoneProjectView } from "./_mappers"
import MilestonesClient from "./MilestonesClient"

// cookies() hace esta ruta dinámica, pero el try/catch de abajo atrapa el bailout
// dinámico de Next (DynamicServerError). Lo forzamos explícitamente para que la
// página NUNCA se prerenderice estática (lo que congelaría los datos al build y
// anularía el prefetch por cookie en producción).
export const dynamic = "force-dynamic"

/**
 * PM-171 Fase 1 (POC progressive enhancement): Server Component que prefetcha el
 * overview de milestones server-side usando la cookie httpOnly pm_session, y pasa
 * los datos ya transformados a MilestonesClient como initialProjects.
 *
 * Si NO hay cookie (sesión previa al deploy de Fase 0) o el backend falla,
 * initialProjects queda en null y el cliente hace el fetch de siempre con el token
 * de localStorage — así no se rompe ninguna sesión. Como milestonesService no
 * cachea (fetch per-request), ejecutarlo en server no filtra datos entre usuarios.
 */
export default async function MilestonesPage() {
  let initialProjects: MilestoneProjectView[] | null = null

  try {
    const overview = await serverFetch<MilestonesOverview>("/dashboard/milestones-overview")
    initialProjects = buildMilestoneViews(overview)
  } catch {
    initialProjects = null
  }

  return <MilestonesClient initialProjects={initialProjects} />
}
