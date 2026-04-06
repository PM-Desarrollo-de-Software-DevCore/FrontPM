"use client"

import { useRef, useState } from "react"
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

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

const labels = ["01-01", "02-01", "03-01", "04-01", "05-01", "06-01"]

const planned = [10, 20, 40, 60, 80, 100]
const real = [5, 15, 30, 50, 70, 85]

export default function ProgressChart() {
  const chartRef = useRef<any>(null)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("This Week")

  const periods = ["This Day", "This Week", "This Month"]

  const data = {
    labels,
    datasets: [
      {
        label: "Planeado",
        data: planned,
        borderColor: "#6d1994",
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) return null

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          )
          gradient.addColorStop(0, "rgba(153, 40, 184, 0.4)")
          gradient.addColorStop(1, "rgba(106, 56, 162, 0.05)")
          return gradient
        },
        fill: true,
        tension: 0.4,

        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6d1994",
        pointBorderColor: "#6d1994",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,

        borderWidth: 3,
      },
      {
        label: "Real",
        data: real,
        borderColor: "#F97316",
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) return null

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          )
          gradient.addColorStop(0, "rgba(249,115,22,0.4)")
          gradient.addColorStop(1, "rgba(249,115,22,0.05)")
          return gradient
        },
        fill: true,
        tension: 0.4,

        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#F97316",
        pointBorderColor: "#F97316",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,

        borderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index" as const,
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#111",
        bodyColor: "#111",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}%`
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          stepSize: 20,
        },
      },
    },
  }

  return (
    <div className="w-full">

      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-slate-900">
          Performance
        </h3>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="min-w-[146px] rounded-xl bg-[#198094]/15 border border-[#198094]/25 px-4 py-2 text-sm font-semibold text-[#198094] transition hover:bg-[#198094]/20 flex items-center justify-center gap-2"
          >
            {selectedPeriod}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition ${
                    selectedPeriod === period
                      ? "bg-teal-100 text-teal-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  )
}