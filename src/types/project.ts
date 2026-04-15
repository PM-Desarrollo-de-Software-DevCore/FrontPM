export type ProjectStatus = "Planning" | "In Progress" | "Completed";
export type ProjectPriority = "High" | "Medium" | "Low";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  tasks: number;
  owner: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  team: string[];
}