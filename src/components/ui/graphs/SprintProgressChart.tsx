"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip)

// Extraido de milestones/page.tsx para cargarlo con next/dynamic y sacar chart.js
// del bundle inicial de la ruta /milestones.
export default function SprintProgressChart({ sprint }: { sprint: { progress: number } }) {
  const data = {
    labels: ["Complete", "Remaining"],
    datasets: [
      {
        data: [sprint.progress, 100 - sprint.progress],
        backgroundColor: ["#2563eb", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
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
          label(context) {
            return `${context.parsed}%`
          },
        },
      },
    },
  }

  const percentagePlugin: Plugin<"doughnut"> = {
    id: "textCenter",
    beforeDatasetsDraw(chart) {
      const { ctx, width, height } = chart
      ctx.save()

      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#0f172a"
      ctx.fillText(`${sprint.progress}%`, width / 2, height / 2)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#64748b"
      ctx.fillText("Progress", width / 2, height / 2 + 25)

      ctx.restore()
    },
  }

  return <Doughnut data={data} options={options} plugins={[percentagePlugin]} />
}
