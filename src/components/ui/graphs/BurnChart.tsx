"use client"

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
import { BurnPoint } from "@/types/finance"
import { formatMoney } from "@/lib/utils"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler)

type BurnChartProps = {
  burnSeries: BurnPoint[]
  budget: number | null
}

export default function BurnChart({ burnSeries, budget }: BurnChartProps) {
  const labels = burnSeries.map((point) => point.month)
  const hasBudget = budget !== null && budget !== undefined

  const datasets = [
    {
      label: "Costo estimado acumulado",
      data: burnSeries.map((point) => point.cumulativeEstimatedCost),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.12)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
      borderDash: [] as number[],
    },
    ...(hasBudget
      ? [
          {
            label: "Presupuesto",
            data: labels.map(() => budget as number),
            borderColor: "#ef4444",
            backgroundColor: "transparent",
            fill: false,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
            borderWidth: 2,
            borderDash: [6, 6],
          },
        ]
      : []),
  ]

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: true, position: "bottom" as const, labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111",
        bodyColor: "#111",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: { dataset: { label?: string }; raw: unknown }) =>
            `${context.dataset.label}: ${formatMoney(Number(context.raw))}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          font: { size: 11 },
          callback: (value: string | number) => formatMoney(Number(value)),
        },
      },
    },
  }

  if (burnSeries.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Sin datos de burn todavía.</p>
  }

  return (
    <div className="h-64 w-full">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  )
}
