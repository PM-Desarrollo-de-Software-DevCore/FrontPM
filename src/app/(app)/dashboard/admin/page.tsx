"use client"

import Carrousel from "@/components/ui/card/projectCarrousel"
import { Card, CardContent } from "@/components/ui/card/card"
import StatsRow from "@/components/ui/graphs/stats_cards"
import Leaderboard from "@/components/ui/graphs/user_table"
import UnassignedTasks from "@/components/ui/graphs/unssaingedTasks"
import Logs from "@/components/ui/graphs/logs"

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-4">

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-strong">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
          <Card className="w-full">
            <CardContent style={{ padding: 2 }}>
              <Carrousel />
            </CardContent>
          </Card>

          <StatsRow />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr_5fr] gap-4 items-stretch">
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            <Logs />
          </div>
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            <Leaderboard />
          </div>
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            <UnassignedTasks />
          </div>
        </div>

      </div>
    </div>
  )
}