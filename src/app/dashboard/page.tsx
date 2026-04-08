import TaskChart from "../../components/ui/graphs/TaskChart"
import DonutChart from "../../components/ui/graphs/DonutChart"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card/card"
import ProgressChart from "../../components/ui/graphs/ProgressChart"
import TotalProgress from "../../components/ui/graphs/totalProgress"

export default function DashboardPage() {
  return (
    <div className="w-full h-full -mt-9 px-8 py-4 space-y-4">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-5 gap-4">
        

        {/*task chart*/}
        <Card className="col-span-3 h-[450px]">
          <CardContent className="h-full pb-2 pt-4">
            <div className="w-full h-full">
              <TaskChart />
            </div>
          </CardContent>
        </Card>


    <div className="col-span-2 flex flex-col gap-4">


      {/* total progress */}
      <Card className="h-[180px]">
        <CardContent className="h-full pt-5">
          <TotalProgress />
        </CardContent>
      </Card>
    

      {/* donut chart */}
      <Card className="h-[300px]">
        <CardContent className="h-full pt-5">
          <DonutChart />
        </CardContent>
      </Card>

    </div>


        {/* planned vs real */}
        <Card className="col-span-3 -mt-11">
          <CardContent className="h-full pb-2 pt-4">
            <div className="w-full h-[360px] mt-0">
              <ProgressChart />
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}