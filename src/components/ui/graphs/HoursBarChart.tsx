"use client"

import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js"
import { Bar } from "react-chartjs-2"
import { formatNumber } from "@/lib/utils"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

type HoursBarChartProps = {
  labels: string[]
  values: number[]
  color?: string
}

export default function HoursBarChart({ labels, values, color = "#6366f1" }: HoursBarChartProps) {
  if (labels.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Sin horas registradas.</p>
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Horas",
        data: values,
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  }

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => `${formatNumber(Number(context.raw))} h`,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  }

  return (
    <div className="h-full w-full">
      <Bar data={data} options={options} />
    </div>
  )
}
