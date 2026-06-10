"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  type ScriptableContext,
  type TooltipItem,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useWeeklyProgress } from "@/hooks/useDashboardStats"

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
)


function getDaysInRange(from: string, to: string) {
  const days: { iso: string; label: string }[] = []
  const cur = new Date(from + "T00:00:00")
  const end = new Date(to + "T00:00:00")

  while (cur <= end) {
    days.push({
      iso: cur.toISOString().slice(0, 10),
      label: cur.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }),
    })
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

const getToday = () => new Date().toISOString().slice(0, 10)
const getDateNDaysAgo = (n: number) =>
  new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

type Props = {
  filters?: { sprint?: string; project?: string; dateFrom?: string; dateTo?: string }
}

export default function ThroughputChart({ filters }: Props) {
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const dateFrom = filters?.dateFrom || getDateNDaysAgo(7)
  const dateTo = filters?.dateTo || getToday()

  const { data, loading, error } = useWeeklyProgress({
    ...filters,
    dateFrom,
    dateTo,
  })


  const days = getDaysInRange(dateFrom, dateTo)

  const completedTasks = days.map((day) => {
    const found = data?.dailyCompletions.find((d) => d.date === day.iso)
    return found?.completed ?? 0
  })

  const chartData = {
    labels: days.map((d) => d.label),
    datasets: [
      {
        label: "Tasks Completed",
        data: completedTasks,
        borderColor: "#6366f1",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return "rgba(99, 102, 241, 0.05)"
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.05)")
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6366f1",
        borderWidth: 3,
      },
    ],
  }


  const rangeLabel = `${new Date(dateFrom + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "short",
  })} – ${new Date(dateTo + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  })}`

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111",
        bodyColor: "#111",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<"line">) => `Tareas: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {

          maxRotation: days.length > 10 ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { stepSize: 1 },
      },
    },
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Detail Progress</h3>
          <p className="text-sm text-gray-500">{rangeLabel}</p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900"></h3>
          <p className="text-sm text-gray-500">{rangeLabel}</p>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Detail Progress</h3>
        <p className="text-sm text-gray-500">{rangeLabel}</p>
      </div>
      <div className="flex-1">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}

