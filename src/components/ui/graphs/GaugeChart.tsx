"use client"

import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { formatRatio } from "@/lib/utils"

ChartJS.register(ArcElement, Tooltip)

type GaugeChartProps = {
  /** Ratio 0..1 (puede exceder 1: se rellena al 100% y se colorea de alerta). */
  value: number | null | undefined
  label?: string
  /** Umbral amarillo y rojo sobre el ratio. */
  warnAt?: number
  dangerAt?: number
}

export default function GaugeChart({ value, label, warnAt = 0.8, dangerAt = 1 }: GaugeChartProps) {
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value)
  const ratio = hasValue ? (value as number) : 0
  const filled = Math.max(0, Math.min(ratio, 1))

  const color = !hasValue
    ? "#cbd5e1"
    : ratio >= dangerAt
    ? "#ef4444"
    : ratio >= warnAt
    ? "#eab308"
    : "#22c55e"

  const data = {
    labels: ["", ""],
    datasets: [
      {
        data: [filled, 1 - filled],
        backgroundColor: [color, "#e5e7eb"],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-24 w-full">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-xl font-bold text-slate-800">
            {hasValue ? formatRatio(ratio) : "N/A"}
          </span>
        </div>
      </div>
      {label && <p className="mt-1 text-center text-xs text-slate-500">{label}</p>}
    </div>
  )
}
