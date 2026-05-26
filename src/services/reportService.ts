import { getToken } from "@/lib/auth"

export function getProjectReportUrl(projectId: string, download = false): string {
  const token = getToken()
  const params = new URLSearchParams()

  if (token) {
    params.set("token", token)
  }

  if (download) {
    params.set("download", "1")
  }

  params.set("ts", String(Date.now()))

  return `/api/projects/${projectId}/report?${params.toString()}`
}