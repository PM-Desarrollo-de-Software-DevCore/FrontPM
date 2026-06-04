"use client"

import { useRealVsPlanned } from "@/hooks/useDashboardStats"

type Props = {
  projectId?: string
  filters?: { project?: string; dateFrom?: string; dateTo?: string }
}

export default function TotalProgress({ projectId, filters }: Props) {
  const { data, loading, error } = useRealVsPlanned(filters)

  const project = data?.projectsChart?.find((p) => p.id_project === projectId)

  const progress = project?.plannedPercentage ?? 0

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-strong">Planned Progress</h3>
        <p className="text-sm text-muted">Planned progress based on due date tasks</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-end gap-2">
          {loading ? (
            <div className="h-12 w-24 animate-pulse bg-slate-200 rounded-md" />
          ) : (
            <span className="text-5xl font-bold text-strong">{progress}%</span>
          )}
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-700"
            style={{ width: loading ? "0%" : `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}