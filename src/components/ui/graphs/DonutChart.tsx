"use client"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

export default function WorkloadChart() {

  const data = {
    labels: ["Ana", "Luis", "Carlos", "Sofía"],
    datasets: [
      {
        label: "Tasks",
        data: [8, 5, 10, 6],
        backgroundColor: (ctx: any) => {
          const value = ctx.raw
          if (value >= 9) return "#ef4444"
          if (value >= 6) return "#eab308"
          return "#22c55e"
        },
        borderRadius: 8,
        barThickness: 14,
      },
    ],
  }

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false, 
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
            return `${context.raw} tasks`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: "#64748b",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#334155",
          font: {
            weight: 500,
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Workload
        </h3>
        <p className="text-sm text-gray-500">
          Workload per team member 
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <Bar data={data} options={options} />
      </div>

    </div>
  )
}