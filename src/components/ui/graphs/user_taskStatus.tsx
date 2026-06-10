"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
  type Chart,
  type TooltipItem,
} from "chart.js"
import { Pie } from "react-chartjs-2"
import { DashboardData } from "@/hooks/useDashboardStats"

ChartJS.register(ArcElement, Tooltip, Legend)


const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed:   { label: "Completed",   color: "#22c55e" },
  overdue:     { label: "Overdue",     color: "#ef4444" },
  in_progress: { label: "In Progress", color: "#3b82f6" },
  pending:     { label: "Pending",     color: "#eab308" },
}

type Props = {
  dashboardData: DashboardData | null
  tasks?: Array<{ status: string; isOverdue?: boolean; project?: { id_project: string } }>
  projectId?: string
  loading?: boolean
  error?: string | null
}

const getTaskStatusCounts = (tasks: Array<{ status: string; isOverdue?: boolean }>) => {
  return tasks.reduce<Record<string, number>>((acc, task) => {
    const status = task.isOverdue || task.status === "on_hold" ? "overdue" : task.status
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})
}

export default function TasksChart({ dashboardData, tasks, projectId, loading, error }: Props) {
  const filteredTasks = projectId
    ? tasks?.filter((task) => task.project?.id_project === projectId) ?? []
    : tasks

  const statusCounts = filteredTasks !== undefined ? getTaskStatusCounts(filteredTasks) : undefined

  const rawItems = statusCounts
    ? Object.entries(statusCounts)
        .map(([status, count]) => ({
          label: STATUS_CONFIG[status]?.label ?? status,
          color: STATUS_CONFIG[status]?.color ?? "#94a3b8",
          count,
        }))
        .filter((item) => item.count > 0)
    : dashboardData?.tasksByStatus?.filter((s) => s.count > 0)
        .map((s) => {
          const status = s.status === "on_hold" ? "overdue" : s.status
          return {
            label: STATUS_CONFIG[status]?.label ?? status,
            color: STATUS_CONFIG[status]?.color ?? "#94a3b8",
            count: s.count,
          }
        }) ??
      dashboardData
        ? [
            { label: "Completed",   color: "#22c55e", count: dashboardData.summary.completedTasks  },
            { label: "Overdue",     color: "#ef4444", count: dashboardData.summary.overdueTasks    },
            { label: "In Progress", color: "#3b82f6", count: dashboardData.summary.inProgressTasks },
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
          label: function (context: TooltipItem<"pie">) {
            return context.label + ": " + context.parsed + "%"
          },
        },
      },
    },
  }

  const percentagePlugin = {
    id: "textCenter",
    beforeDatasetsDraw(chart: Chart<"pie">) {
      const { ctx } = chart
      ctx.save()

      chart.data.datasets[0].data.forEach((datapoint, index) => {
        const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition(false)
        if (x == null || y == null) return
        ctx.fillStyle = "white"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${datapoint ?? 0}%`, x, y)
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