import type { Project } from '@/types/project';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}


function projectToBackendFormat(project: any) {
  return {
    name: project.name,
    description: project.description,
    start_date: project.startDate,
    end_date: project.endDate,
    priority: project.priority?.toLowerCase(),
    status: project.status?.toLowerCase(),
  };
}


function projectFromBackendFormat(data: any): Project {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    priority: data.priority?.charAt(0).toUpperCase() + data.priority?.slice(1) || 'Medium',
    status: data.status?.charAt(0).toUpperCase() + data.status?.slice(1) || 'Planning',
    progress: data.progress || 0,
    tasks: data.tasks || 0,
    owner: data.owner || '',
    team: data.team || [],
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudieron obtener los proyectos');
  }

  const data = await response.json();
  const projects = Array.isArray(data) ? data : data.data || [];
  return projects.map(projectFromBackendFormat);
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

export async function createProject(project: Omit<Project, 'id' | 'progress' | 'tasks' | 'owner' | 'team'>): Promise<Project> {
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
  return projectFromBackendFormat(createdProject);
}

export async function updateProject(projectId: string, project: Partial<Project>): Promise<Project> {
  const backendData = projectToBackendFormat(project);
  
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    throw new Error('No se pudo actualizar el proyecto');
  }

  const data = await response.json();
  const updatedProject = data.data || data;
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
}