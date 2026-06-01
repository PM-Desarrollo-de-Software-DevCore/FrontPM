"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { formatMoney } from "@/lib/utils"

ChartJS.register(ArcElement, Tooltip, Legend)

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

type CategoryDonutProps = {
  labels: string[]
  values: number[]
  emptyLabel?: string
}

export default function CategoryDonut({ labels, values, emptyLabel = "Sin datos." }: CategoryDonutProps) {
  if (labels.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, index) => PALETTE[index % PALETTE.length]),
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (context: { label?: string; raw: unknown }) =>
            ` ${context.label}: ${formatMoney(Number(context.raw))}`,
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Doughnut data={data} options={options} />
    </div>
  )
}
