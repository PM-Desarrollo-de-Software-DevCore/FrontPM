"use client"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  TooltipItem,
  Tooltip,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

type HoursChartProps = {
  title?: string
  description?: string
  labels?: string[]
  values?: number[]
  valueSuffix?: string
  max?: number
}

export default function HoursChart({
  title = "Hours Worked",
  description = "Total hours worked per team member",
  labels = ["Ana", "Luis", "Carlos", "Sofia"],
  values = [198, 175, 162, 158, 148, 145, 156],
  valueSuffix = "h",
  max,
}: HoursChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: "#2563eb",
        borderRadius: 8,
        barThickness: 18,
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
          label: function (context: TooltipItem<"bar">) {
            return `${context.raw}${valueSuffix}`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: max,
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


      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>


      <div className="flex-1">
        <Bar data={data} options={options} />
      </div>

    </div>
  )
}