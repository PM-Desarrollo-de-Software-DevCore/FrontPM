import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Button } from "@/components/ui/Button/button";
import TaskChart from "@/components/ui/graphs/taskResume"


export default function ProfileDashboard() {
  return (
    <div className="grid grid-cols-12 gap-8 px-10 py-8 max-w-[1400px] mx-auto">

      <div className="col-span-3 flex flex-col gap-5">
        <Card className="rounded-2xl shadow-sm p-6 text-center w-full border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full border-[3px] border-pink-500 overflow-hidden">
              <Image src="/images/persona.png" alt="profile" width={100} height={100} />
            </div>
            <h2 className="font-semibold text-lg">Yash Ghori</h2>
            <p className="text-sm text-gray-500">Ahmedabad, Gujarat</p>
          </div>
        </Card>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 text-sm w-full">
          Request Modification
        </Button>
      </div>

        <div className="col-span-6">
        <Card className="rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col gap-6 max-h-[633px] overflow-y-auto">
          <h2 className="text-xl font-semibold">Tasks</h2>

          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 px-6 py-5 shadow-sm"
            >
              <p className="font-semibold text-base">
                Make an Automatic Payment System
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Opened 10 days ago
              </p>

              <div className="flex gap-2 mt-3">
                <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="col-span-3 flex flex-col gap-6">

        <Card className="rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold mb-4">Leaderboard</h2>

          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/persona.png"
                    alt="user"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                  <span className="text-sm">Yash Ghori</span>
                </div>
                <span className="text-sm font-medium">19200</span>
              </div>
            ))}
          </div>
        </Card>


        <Card className="rounded-2xl shadow-sm p-6 border border-gray-100 overflow-visible">
          <div className="flex justify-center items-center pt-2 pb-4">
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <TaskChart />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}