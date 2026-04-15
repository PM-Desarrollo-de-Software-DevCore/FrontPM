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

export default function HoursChart() {

  const data = {
    labels: ["Ana", "Luis", "Carlos", "Sofia"],
    datasets: [
      {
        label: "Horas",
        data: [198, 175, 162, 158, 148, 145, 156],
        backgroundColor: "#22c55e", 
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
            return `${context.raw}h trabajadas`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 220,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value}h`,
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


      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Hours Worked
        </h3>
        <p className="text-sm text-gray-500">
          Total hours worked per team member 
        </p>
      </div>


      <div className="flex-1">
        <Bar data={data} options={options} />
      </div>

    </div>
  )
}