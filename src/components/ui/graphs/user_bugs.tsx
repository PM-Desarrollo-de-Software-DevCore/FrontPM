"use client"

type Bug = {
  id: number
  status: "resolved" | "open"
}

const bugs: Bug[] = [
  { id: 1, status: "resolved" },
  { id: 2, status: "resolved" },
  { id: 3, status: "open" },
  { id: 4, status: "resolved" },
  { id: 5, status: "open" },
  { id: 6, status: "resolved" },
]

export default function BugsResolved() {
  const total = bugs.length
  const resolved = bugs.filter((b) => b.status === "resolved").length

  const progress = total === 0 ? 0 : Math.round((resolved / total) * 100)

  return (
    <div className="w-full h-full flex flex-col">
      

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Bugs Resolved 
        </h3>
        <p className="text-sm text-gray-500">
          Percentage of bugs resolved in the current sprint
        </p>
      </div>


      <div className="flex-1 flex flex-col justify-center">
        
   
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold text-slate-900">
            {progress}%
          </span>
          <span className="text-sm text-gray-500 mb-1">
            ({resolved}/{total})
          </span>
        </div>


        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  )
}