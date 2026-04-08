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

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

const labels = ["01-Jan", "02-Jan", "03-Jan", "04-Jan", "05-Jan", "06-Jan"]

const planned = [10, 20, 40, 60, 80, 100]
const real = [5, 15, 30, 50, 70, 85]

export default function ProgressChart() {
  const chartRef = useRef<any>(null)

  const data = {
    labels,
    datasets: [
      {
        label: "Planned",
        data: planned,
        borderColor: "#6366f1",
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          )
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.05)")
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6366f1",
        borderWidth: 3,
      },
      {
        label: "Real",
        data: real,
        borderColor: "#22c55e",
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          )
          gradient.addColorStop(0, "rgba(34,197,94,0.4)")
          gradient.addColorStop(1, "rgba(34,197,94,0.05)")
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#22c55e",
        borderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111",
        bodyColor: "#111",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}%`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          stepSize: 20,
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header limpio */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Performance
        </h3>
        <p className="text-sm text-gray-500">
          Planned vs Real progress over time
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <Line ref={chartRef} data={data} options={options} />
      </div>

    </div>
  )
}