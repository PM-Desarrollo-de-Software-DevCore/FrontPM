import TaskChart from "../../components/ui/TaskChart"
import DonutChart from "../../components/ui/DonutChart"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import ProgressChart from "../../components/ui/ProgressChart"

export default function DashboardPage() {
  return (
    <div className="w-full h-full -mt-9 px-8 py-4 space-y-4">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-5 gap-4">

        {/*task chart*/}
        <Card className="col-span-3">
          <CardHeader className="pb-2" />

          <CardContent className="flex-1 min-h-0">
            <div className="w-full h-[360px] flex items-center justify-center">
              <TaskChart />
            </div>
          </CardContent>
        </Card>

        {/* donut chart */}
        <Card className="col-span-2">
          <CardContent className="flex-1 min-h-0 pt-5">
            <div className="w-full h-[260px] flex justify-center">
              <div className="mt-0">
                <DonutChart />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* planned vs real */}
        <Card className="col-span-3">
          <CardHeader className="pb-2" />
          <CardContent className="flex-1 min-h-0 pb-6">
            <div className="w-full h-[360px] flex items-center justify-center mt-4 mb-6">
              <ProgressChart />
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}