"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function TasksChart() {

  const data = {
    labels: ["Completed", "On Hold", "On Progress", "Pending"],
    datasets: [
      {
        data: [32, 25, 25, 18],
        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#3b82f6",
          "#eab308",
        ],
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 24,
    },
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
            return context.label + ": " + context.parsed + "%"
          },
        },
      },
    },
  }

  const percentagePlugin = {
    id: "textCenter",
    beforeDatasetsDraw(chart: any) {
      const { ctx } = chart
      ctx.save()

      chart.data.datasets[0].data.forEach((datapoint: number, index: number) => {
        const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition()
        ctx.fillStyle = "white"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(datapoint + "%", x, y)
      })
    },
  }

  return (
    <div className="w-full h-full flex flex-col">


      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Tasks
        </h3>
        <p className="text-sm text-gray-500">
          Task status
        </p>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row items-center gap-8">

        <div className="flex-1 h-full">
          <Pie data={data} options={options} plugins={[percentagePlugin as Plugin]} />
        </div>


        <div className="w-full lg:w-[30%]">
          <div className="flex flex-col justify-center gap-4">
            {data.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-sm"
                  style={{
                    backgroundColor:
                      data.datasets[0].backgroundColor[index] as string,
                  }}
                />
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}