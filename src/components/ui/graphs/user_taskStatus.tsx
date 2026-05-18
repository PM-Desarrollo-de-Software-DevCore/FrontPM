"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from "chart.js"
import { Pie } from "react-chartjs-2"
import { DashboardData } from "@/hooks/useDashboardStats"

ChartJS.register(ArcElement, Tooltip, Legend)


const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed:   { label: "Completed",   color: "#22c55e" },
  on_hold:     { label: "On Hold",     color: "#ef4444" },
  in_progress: { label: "On Progress", color: "#3b82f6" },
  pending:     { label: "Pending",     color: "#eab308" },
}

type Props = {
  dashboardData: DashboardData | null
  loading?: boolean
  error?: string | null
}

export default function TasksChart({ dashboardData, loading, error }: Props) {


  const rawItems = dashboardData?.tasksByStatus?.filter((s) => s.count > 0).length
    ? dashboardData.tasksByStatus
        .filter((s) => s.count > 0)
        .map((s) => ({
          label: STATUS_CONFIG[s.status]?.label ?? s.status,
          color: STATUS_CONFIG[s.status]?.color ?? "#94a3b8",
          count: s.count,
        }))
    : dashboardData
    ? [
        { label: "Completed",   color: "#22c55e", count: dashboardData.summary.completedTasks  },
        { label: "On Hold",     color: "#ef4444", count: dashboardData.summary.overdueTasks    },
        { label: "On Progress", color: "#3b82f6", count: dashboardData.summary.inProgressTasks },
        { label: "Pending",     color: "#eab308", count: dashboardData.summary.pendingTasks    },
      ].filter((i) => i.count > 0)
    : []

  const total = rawItems.reduce((sum, i) => sum + i.count, 0)


  const data = {
    labels: rawItems.map((i) => i.label),
    datasets: [
      {
        data: rawItems.map((i) =>
          total > 0 ? Math.round((i.count / total) * 100) : 0
        ),
        backgroundColor: rawItems.map((i) => i.color),
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 24,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#1f2937",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            return context.label + ": " + context.parsed + "%"
          },
        },
      },
    },
  }

  const percentagePlugin = {
    id: "textCenter",
    beforeDatasetsDraw(chart: any) {
      const { ctx } = chart
      ctx.save()

      chart.data.datasets[0].data.forEach((datapoint: number, index: number) => {
        const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition()
        ctx.fillStyle = "white"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(datapoint + "%", x, y)
      })
    },
  }


  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
          <p className="text-sm text-gray-500">Task status</p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
          <p className="text-sm text-gray-500">Task status</p>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-red-500">
          {error}
        </div>
      </div>
    )
  }


  return (
    <div className="w-full h-full flex flex-col">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Tasks
        </h3>
        <p className="text-sm text-gray-500">
          Task status
        </p>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row items-center gap-8">

        <div className="flex-1 h-full">
          <Pie data={data} options={options} plugins={[percentagePlugin as Plugin]} />
        </div>

        <div className="w-full lg:w-[30%]">
          <div className="flex flex-col justify-center gap-4">
            {data.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-sm"
                  style={{
                    backgroundColor:
                      data.datasets[0].backgroundColor[index] as string,
                  }}
                />
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}