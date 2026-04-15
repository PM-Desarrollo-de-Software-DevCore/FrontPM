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

export default function BurndownChart() {

  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]

    const ideal = [10, 8, 6, 4, 3, 1, 0]
    const actual = [10, 9, 7, 5, 5, 2, 1]

  const data = {
    labels,
    datasets: [
      {
        label: "Ideal",
        data: ideal,
        borderColor: "rgba(34,197,94,0.35)", 
        borderDash: [6, 6],
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Actual",
        data: actual,
        borderColor: "#eab308", 
        backgroundColor: "#eab308",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#eab308",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
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
            return `${context.raw} tasks remaining`
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
          Burndown
        </h3>
        <p className="text-sm text-gray-500">
          Progress of remaining tasks vs. ideal plan
        </p>
      </div>


      <div className="flex-1">
        <Line data={data} options={options} />
      </div>

    </div>
  )
}