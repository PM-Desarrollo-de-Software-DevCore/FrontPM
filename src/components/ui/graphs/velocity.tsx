"use client"

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip)

export default function VelocityChart() {

  const data = {
    labels: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
    datasets: [
      {
        label: "Velocity",
        data: [10, 12, 8, 6, 12], 
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.4, 
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
      },
    ],
  }

  const options = {
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
            return `${context.raw} finished tasks`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: "#64748b",
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex flex-col">


      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Velocity
        </h3>
        <p className="text-sm text-gray-500">
          Work completed per sprint
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>

    </div>
  )
}