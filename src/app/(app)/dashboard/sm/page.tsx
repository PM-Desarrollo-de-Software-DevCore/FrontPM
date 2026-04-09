import TaskChart from "@/components/ui/graphs/TaskChart"
import DonutChart from "@/components/ui/graphs/DonutChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import ProgressChart from "@/components/ui/graphs/ProgressChart"
import TotalProgress from "@/components/ui/graphs/totalProgress"
import ProjectCard from "@/components/ui/graphs/project_dash"


export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-4">

      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">


        <div className="flex flex-col gap-4 lg:col-span-2">

          <Card className="h-auto lg:h-[450px] overflow-hidden">
            <CardContent className="h-full pt-4 overflow-auto">
              <ProjectCard />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[200px]">
            <CardContent className="h-full pt-5">
              <TotalProgress />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[246px] overflow-hidden">
            <CardContent className="h-full pt-5 flex items-center justify-center">
              <div className="w-full h-full">
                <DonutChart />
              </div>
            </CardContent>
          </Card>

        </div>


        <div className="flex flex-col gap-4 lg:col-span-4">

          <Card className="h-auto lg:h-[450px]">
            <CardContent className="h-full pt-4">
              <TaskChart />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[462px]">
            <CardContent className="h-full pt-4">
              <ProgressChart />
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}