import type { Project } from '@/types/project';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ProjectPayload {
  name: string;
  description: string;
  client: string;
  projectType: string;
  projectObjective: string;
  methodology: string;
  estimatedSprints?: number;
  budget?: number;
  monthlyCost?: number;
  billingModel?: string;
  startDate: string;
  endDate: string;
  priority: Project['priority'];
  status: Project['status'];
}

function convertDateToISO(dateString?: string): string | undefined {
  // Vacío -> undefined para OMITIR la fecha del payload. Enviar "" hace que el
  // validador (z.coerce.date) la interprete como Invalid Date y devuelva 400.
  if (!dateString) return undefined;
  if (dateString.includes("T")) return dateString;
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function projectToBackendFormat(project: Partial<ProjectPayload>) {
  return {
    name: project.name,
    description: project.description,
    client: project.client,
    project_type: project.projectType,
    project_objective: project.projectObjective,
    methodology: project.methodology?.toLowerCase(),
    estimated_sprints: project.estimatedSprints,
    budget: project.budget,
    monthly_cost: project.monthlyCost,
    billing_model: project.billingModel?.toLowerCase(),
    start_date: convertDateToISO(project.startDate),
    end_date: convertDateToISO(project.endDate),
    priority: project.priority?.toLowerCase(),
    status: project.status?.toLowerCase(),
  };
}


interface BackendProject {
  id?: string;
  id_project?: string;
  name?: string;
  description?: string;
  client?: string;
  project_type?: string;
  projectType?: string;
  project_objective?: string;
  projectObjective?: string;
  methodology?: string;
  estimated_sprints?: number;
  estimatedSprints?: number;
  budget?: number;
  monthly_cost?: number;
  monthlyCost?: number;
  billing_model?: string;
  billingModel?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
  status?: string;
  progress?: number;
  tasks?: number;
  owner?: string;
  team?: string[];
}

function projectFromBackendFormat(data: BackendProject): Project {
  return {
    id: data.id ?? data.id_project ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    client: data.client,
    projectType: data.project_type ?? data.projectType,
    projectObjective: data.project_objective ?? data.projectObjective,
    methodology: data.methodology,
    estimatedSprints: data.estimated_sprints ?? data.estimatedSprints,
    budget: data.budget,
    monthlyCost: data.monthly_cost ?? data.monthlyCost,
    billingModel: data.billing_model ?? data.billingModel,
    startDate: data.start_date ?? '',
    endDate: data.end_date ?? '',
    priority: (data.priority
      ? data.priority.charAt(0).toUpperCase() + data.priority.slice(1)
      : 'Medium') as Project['priority'],
    status: (data.status
      ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
      : 'Planning') as Project['status'],
    progress: data.progress ?? 0,
    tasks: data.tasks ?? 0,
    owner: data.owner ?? '',
    team: data.team ?? [],
  };
}

// Caché + dedup in-flight de la lista de proyectos. La piden varias páginas
// (worklogs, projects, milestones, dashboards) y el buscador; sin caché cada una
// refetchea el mismo payload. Con dedup las llamadas concurrentes comparten 1 request
// y el TTL evita refetch en navegaciones seguidas. Se invalida en cada mutación de
// proyecto (abajo) para no mostrar listas viejas.
const PROJECTS_TTL_MS = 30_000;
let projectsCache: { data: Project[]; ts: number } | null = null;
let projectsInflight: Promise<Project[]> | null = null;

export function invalidateProjectsCache(): void {
  projectsCache = null;
  projectsInflight = null;
}

export async function getProjects(): Promise<Project[]> {
  if (projectsCache && Date.now() - projectsCache.ts < PROJECTS_TTL_MS) {
    return projectsCache.data;
  }
  if (projectsInflight) {
    return projectsInflight;
  }

  projectsInflight = (async () => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('No se pudieron obtener los proyectos');
    }

    const data = await response.json();
    const raw = Array.isArray(data) ? data : data.data || [];
    const projects = raw.map(projectFromBackendFormat);
    projectsCache = { data: projects, ts: Date.now() };
    return projects;
  })();

  try {
    return await projectsInflight;
  } finally {
    projectsInflight = null;
  }
}

// Prefetch fire-and-forget: warma la caché de proyectos desde el shell de la app
// para que worklogs/projects/milestones abran sin esperar el round-trip de /projects.
export function prefetchProjects(): void {
  if (!getToken()) return;
  if (projectsCache && Date.now() - projectsCache.ts < PROJECTS_TTL_MS) return;
  if (projectsInflight) return;
  void getProjects().catch(() => {});
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el proyecto');
  }

  const data = await response.json();
  const project = data.data || data;
  return projectFromBackendFormat(project);
}

export async function createProject(project: ProjectPayload): Promise<Project> {
  const backendData = projectToBackendFormat(project);

  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'No se pudo crear el proyecto');
  }

  const data = await response.json();
  const createdProject = data.data || data;
  invalidateProjectsCache();
  return projectFromBackendFormat(createdProject);
}

export async function updateProject(projectId: string, project: Partial<ProjectPayload>): Promise<Project> {
  const backendData = projectToBackendFormat(project);
  
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    // Surface el mensaje real del backend (p.ej. validación Zod) en vez de un
    // genérico que oculta la causa del 400.
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'No se pudo actualizar el proyecto');
  }

  const data = await response.json();
  const updatedProject = data.data || data;
  invalidateProjectsCache();
  return projectFromBackendFormat(updatedProject);
}

export async function updateProjectStatus(
  projectId: string,
  status: Project['status']
): Promise<Project> {
  const response = await fetch(`${API_URL}/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: status.toLowerCase() }),
  });

  if (!response.ok) {
    throw new Error('No se pudo actualizar el estado del proyecto');
  }

  const data = await response.json();
  const updatedProject = data.data || data;
  invalidateProjectsCache();
  return projectFromBackendFormat(updatedProject);
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('No se pudo eliminar el proyecto');
  }

  invalidateProjectsCache();
}