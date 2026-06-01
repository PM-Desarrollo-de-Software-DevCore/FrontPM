"use client"

import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  Tooltip,
} from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip)

type FlowChartProps = {
  title?: string
  description?: string
  labels?: string[]
  values?: number[]
  colors?: string[]
}

export default function FlowChart({
  title = "Flow",
  description = "Task status distribution",
  labels = ["Completed", "On Hold", "On Progress", "Pending"],
  values = [32, 25, 25, 18],
  colors = ["#16a34a", "#64748b", "#0ea5e9", "#f59e0b"],
}: FlowChartProps) {

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        spacing: 0,
        hoverOffset: 0,
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
            return `${context.label}: ${context.parsed}`
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
        <Pie data={data} options={options} />
      </div>

    </div>
  )
}