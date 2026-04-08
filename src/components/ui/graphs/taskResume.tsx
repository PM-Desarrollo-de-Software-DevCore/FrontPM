"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartOptions,
} from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip)

export default function TasksChart() {
  const data = {
    labels: ["Completed", "On Hold", "On Progress", "Pending"],
    datasets: [
      {
        data: [32, 25, 25, 18],
        backgroundColor: [
          "#198094",
          "#5D5BFF",
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
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`
          },
        },
      },
    },
  }
    return (
    <div className="w-full">
        <h3 className="text-lg font-semibold text-slate-900 text-center relative top-8 mb-4">
            Tasks
        </h3>
        <div className="w-full h-[260px]">
        <Pie data={data} options={options} />
        </div>
    </div>
    )
}