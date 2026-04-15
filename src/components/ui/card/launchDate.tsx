import { CalendarDays } from "lucide-react"

interface LaunchCardProps {
  daysLeft: number
  date: string
  label?: string
}

export default function LaunchCard({
  daysLeft,
  date,
  label = "Projected Launch Date",
}: LaunchCardProps) {
  return (
    <div className="bg-[#0f4c5c] text-white rounded-2xl p-5 shadow-md w-full max-w-sm">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <CalendarDays size={20} />
        </div>
        <h3 className="text-sm font-medium opacity-90">
          {label}
        </h3>
      </div>

      {/* Days */}
      <div className="text-3xl font-bold leading-tight">
        {daysLeft} Days
      </div>

      {/* Date */}
      <p className="text-sm opacity-80 mt-1">
        {date}
      </p>
    </div>
  )
}