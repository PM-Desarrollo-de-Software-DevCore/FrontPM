import TaskChart from "@/components/ui/graphs/TaskChart"
import DonutChart from "@/components/ui/graphs/DonutChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import ProgressChart from "@/components/ui/graphs/ProgressChart"
import TotalProgress from "@/components/ui/graphs/totalProgress"
import ProjectCard from "@/components/ui/graphs/project_dash"

export default function DashboardPage() {
  return (
    <div className="w-full h-full px-8 pt-4 -mt-8 space-y-4 pb-16">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-6 gap-4">


        <div className="col-span-2 flex flex-col gap-4">

          <Card className="h-[450px]">
            <CardContent className="h-full pt-4 overflow-y-auto">
              <ProjectCard />
            </CardContent>
          </Card>

          <Card className="h-[200px]">
            <CardContent className="h-full pt-5">
              <TotalProgress />
            </CardContent>
          </Card>

          <Card className="h-[246px]">
            <CardContent className="h-full pt-5">
              <DonutChart />
            </CardContent>
          </Card>

        </div>

        <div className="col-span-4 flex flex-col gap-4">

          <Card className="h-[450px]">
            <CardContent className="h-full pt-4">
              <TaskChart />
            </CardContent>
          </Card>

          <Card className="h-[462px]">
            <CardContent className="h-full pt-4">
              <ProgressChart />
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}