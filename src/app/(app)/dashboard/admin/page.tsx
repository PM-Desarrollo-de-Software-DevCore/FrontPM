import Carrousel from "@/components/ui/card/projectCarrousel"
import { Card, CardContent } from "@/components/ui/card/card"
import PerformanceChart from "@/components/ui/graphs/performaceChart"

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-4">
      
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Dashboard
        </h1>

        <Card className="w-full overflow-hidden">
          <CardContent className="p-0 flex justify-center">
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
                  <div key={i} className="rounded-xl border border-zinc-100 px-4 py-3 shadow-sm bg-white">
                    <p className="text-sm font-semibold">User updated project settings</p>
                    <p className="text-xs text-zinc-500 mt-1">Logs · 2 mins ago</p>
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