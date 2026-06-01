"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartOptions,
} from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip)

type TasksChartProps = {
  completed: number
  inProgress: number
  pending: number
}

export default function TasksChart({ completed, inProgress, pending }: TasksChartProps) {
  const safeCompleted = Math.max(0, completed)
  const safeInProgress = Math.max(0, inProgress)
  const safePending = Math.max(0, pending)
  const total = safeCompleted + safeInProgress + safePending
  const valueFor = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0)

  const data = {
    labels: ["Completed", "In progress", "Pending"],
    datasets: [
      {
        data: [
          valueFor(safeCompleted),
          valueFor(safeInProgress),
          valueFor(safePending),
        ],
        backgroundColor: [
          "#198094",
          "#37B2F0",
          "#E14F3D",
        ],
        borderWidth: 0,        
        spacing: 0,            
        hoverOffset: 0,        
      },
    ],
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        enabled: true, 
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#1f2937",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
            label: function (context: { label?: string; parsed?: number }) {
            return `${context.label}: ${context.parsed}%`
          },
        },
      },
    },
  }
    return (
    <div className="w-full">
      <div className="w-full h-65">
      <Pie data={data} options={options} />
      </div>
    </div>
    )
}