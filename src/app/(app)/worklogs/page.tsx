import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card/card"
import HoursChart from "@/components/ui/graphs/hours_perTM"
import VelocityChart from "@/components/ui/graphs/velocity"
import FlowChart from "@/components/ui/graphs/flow"
import { CheckCircle2, CheckSquare, MessageSquare } from "lucide-react"

const completedTasks = [
  { id: "#402235", title: "Make an Automatic Payment System that enable the design", completedBy: "Yash Ghori", avatar: "/images/persona.png" },
  { id: "#402236", title: "Fix login bug on mobile devices", completedBy: "Ana López", avatar: "/images/persona.png" },
  { id: "#402237", title: "Update dashboard UI components", completedBy: "Carlos Ruiz", avatar: "/images/persona.png" },
  { id: "#402238", title: "Integrate third-party payment API", completedBy: "Yash Ghori", avatar: "/images/persona.png" },
  { id: "#402239", title: "Write unit tests for auth module", completedBy: "Ana López", avatar: "/images/persona.png" },
  { id: "#402240", title: "Deploy staging environment", completedBy: "Carlos Ruiz", avatar: "/images/persona.png" },
]

export default function WorklogsPage() {
  return (
    <div className="w-full min-h-screen py-4 px-2 sm:px-4 xl:px-6">

      <div className="max-w-[1800px] mx-auto">

        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">WorkLogs</h1>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full mb-6">

          <Card className="w-full">
            <CardContent className="p-4 sm:p-5">
              <div className="w-full h-[260px] sm:h-[320px] md:h-[360px] xl:h-[420px]">
                <HoursChart />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardContent className="p-4 sm:p-5">
              <div className="w-full h-[260px] sm:h-[320px] md:h-[360px] xl:h-[420px]">
                <VelocityChart />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full md:col-span-2 xl:col-span-1">
            <CardContent className="p-4 sm:p-5">
              <div className="w-full h-[260px] sm:h-[320px] md:h-[360px] xl:h-[420px]">
                <FlowChart />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex flex-col gap-3">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <CheckSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-1">
                        {task.title}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5">
                        Completed by: <span className="font-medium text-gray-400">{task.completedBy}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Completed</span>
                  </div>
                  <Image
                    src={task.avatar}
                    alt={task.completedBy}
                    width={34}
                    height={34}
                    className="rounded-full w-8 h-8 sm:w-9 sm:h-9 object-cover border-2 border-white shadow-sm"
                  />
                  <MessageSquare className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}