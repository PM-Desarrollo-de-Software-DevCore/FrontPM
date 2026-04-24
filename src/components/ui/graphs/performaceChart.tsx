"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
)

const labels = ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan"]

const performance = [1200, 1100, 980, 1050, 900, 870]

export default function PerformanceChart() {
  const chartRef = useRef<any>(null)

  const data = {
    labels,
    datasets: [
      {
        label: "Page Load Time (ms)",
        data: performance,
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
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.raw} ms`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          callback: (value: any) => `${value} ms`,
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex flex-col">
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Performance
        </h3>
        <p className="text-sm text-gray-500">
          Page load time over time
        </p>
      </div>

      <div className="flex-1">
        <Line ref={chartRef} data={data} options={options} />
      </div>

    </div>
  )
}