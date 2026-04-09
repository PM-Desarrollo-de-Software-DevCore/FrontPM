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


const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


const completedTasks = [3, 4, 2, 1, 2, 1, 0]

export default function ThroughputChart() {
  const chartRef = useRef<any>(null)

  const data = {
    labels,
    datasets: [
      {
        label: "Tasks Completed",
        data: completedTasks,
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
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111",
        bodyColor: "#111",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `Tasks: ${context.raw}`
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
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex flex-col">


      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Weekly Progress
        </h3>
        <p className="text-sm text-gray-500">
          Tasks completed per day
        </p>
      </div>

      <div className="flex-1">
        <Line ref={chartRef} data={data} options={options} />
      </div>

    </div>
  )
}