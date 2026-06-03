"use client"

import Carrousel from "@/components/ui/card/projectCarrousel"
import { Card, CardContent } from "@/components/ui/card/card"
import dynamic from "next/dynamic"
const PerformanceChart = dynamic(() => import("@/components/ui/graphs/performaceChart"), { ssr: false, loading: () => <div className="h-full w-full min-h-[200px] animate-pulse rounded-xl bg-slate-100" /> })

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-4">

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-strong">
          Dashboard
        </h1>

<Card className="w-full">
  <CardContent style={{ padding: 2 }}>
    <Carrousel />
  </CardContent>
</Card>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">

          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex flex-col h-[420px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b">
                <h2 className="text-base sm:text-lg font-semibold">Logs</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-border px-4 py-3 shadow-sm bg-card">
                    <p className="text-sm font-semibold text-strong">
                      User updated project settings
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Logs · 2 mins ago
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <Card className="h-[420px] overflow-hidden">
              <CardContent className="pt-5 h-full">
                <PerformanceChart />
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}