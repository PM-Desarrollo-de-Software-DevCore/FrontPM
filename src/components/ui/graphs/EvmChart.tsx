"use client"

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { EvmSeriesPoint } from "@/types/finance"
import { formatMoney } from "@/lib/utils"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

type EvmChartProps = {
  series: EvmSeriesPoint[]
}

export default function EvmChart({ series }: EvmChartProps) {
  const labels = series.map((point) => point.month)

  const makeDataset = (key: "pv" | "ev" | "ac", label: string, color: string) => ({
    label,
    data: series.map((point) => point[key]),
    borderColor: color,
    backgroundColor: color,
    // No interpolar sobre meses futuros (ev/ac llegan null): se corta la línea.
    spanGaps: false,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 5,
    borderWidth: 2,
  })

  const datasets = [
    makeDataset("pv", "PV · Planned Value", "#64748b"),
    makeDataset("ev", "EV · Earned Value", "#22c55e"),
    makeDataset("ac", "AC · Actual Cost", "#ef4444"),
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
            context.raw === null || context.raw === undefined
              ? `${context.dataset.label}: N/A`
              : `${context.dataset.label}: ${formatMoney(Number(context.raw))}`,
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

  if (series.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Sin serie de EVM todavía.</p>
  }

  return (
    <div className="h-72 w-full">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  )
}
