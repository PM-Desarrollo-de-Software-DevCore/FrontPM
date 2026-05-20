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

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type Props = {
  filters?: { sprint?: string; project?: string }
}

export default function ThroughputChart({ filters }: Props) {
  const chartRef = useRef<any>(null)
  const { data, loading, error } = useWeeklyProgress(filters)


  const completedTasks = DAY_ORDER.map((day) => {
    const found = data?.dailyCompletions.find((d) => d.dayOfWeek.toLowerCase() === day)
    return found?.completed ?? 0
  })

  const chartData = {
    labels: DAY_LABELS,
    datasets: [
      {
        label: "Tasks Completed",
        data: completedTasks,
        borderColor: "#6366f1",
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null
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
          label: (context: any) => `Tasks: ${context.raw}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
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
          <h3 className="text-lg font-semibold text-slate-900">Weekly Progress</h3>
          <p className="text-sm text-gray-500">Tasks completed per day</p>
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
          <h3 className="text-lg font-semibold text-slate-900">Weekly Progress</h3>
          <p className="text-sm text-gray-500">Tasks completed per day</p>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Weekly Progress</h3>
        <p className="text-sm text-gray-500">Tasks completed per day</p>
      </div>
      <div className="flex-1">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}