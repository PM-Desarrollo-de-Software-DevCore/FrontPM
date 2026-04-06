"use client"

import { useState } from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DonutChart() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("This Week")

  const periods = ["This Day", "This Week", "This Month"]

  const data = {
    labels: ["Product 1", "Product 2", "Product 3", "Product 4"],
    datasets: [
      {
        data: [40, 20, 15, 25],
        backgroundColor: [
          "#FF4D4D",
          "#4DA6FF",
          "#F5C542",
          "#6BCB77",
        ],
        borderWidth: 0,
      },
    ],
  }

  const options = {
    cutout: "70%",
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Work Log</h3>
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
                    selectedPeriod === period ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-700"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="h-[340px] w-full lg:w-[75%]">
          <div className="h-full w-full">
            <Doughnut data={data} options={options} />
          </div>
        </div>
        <div className="w-full lg:w-[25%]">
          <div className="flex h-full flex-col justify-center gap-4">
            {data.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-sm"
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] as string }}
                />
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}