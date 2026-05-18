"use client"

import { DashboardData } from "@/hooks/useDashboardStats"

type Props = {
  dashboardData: DashboardData | null
  loading?: boolean
  error?: string | null
}

export default function TotalProgress({ dashboardData, loading, error }: Props) {
  const progress = dashboardData?.summary.completionPercentage ?? 0

  return (
    <div className="w-full h-full flex flex-col">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Project Progress
        </h3>
        <p className="text-sm text-gray-500">
          Total progress of based on completed tasks
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">

        <div className="flex items-end gap-2">
          {loading ? (
            <div className="h-12 w-24 animate-pulse bg-slate-200 rounded-md" />
          ) : (
            <span className="text-5xl font-bold text-slate-900">
              {progress}%
            </span>
          )}
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#6366f1] rounded-full transition-all duration-700"
            style={{ width: loading ? "0%" : `${progress}%` }}
          />
        </div>

      </div>
    </div>
  )
}