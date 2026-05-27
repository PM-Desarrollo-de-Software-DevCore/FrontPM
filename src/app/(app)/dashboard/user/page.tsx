"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import TotalProgress from "@/components/ui/graphs/user_projectProg"
import ProjectCard from "@/components/ui/graphs/user_task"
import TaskUser from "@/components/ui/graphs/user_taskStatus"
import Bugs from "@/components/ui/graphs/user_bugs"
import WeeklyProg from "@/components/ui/graphs/user_weekProg"
import Filters from "@/components/ui/filters/filters"
import { useDashboardStats, useUserTasks } from "@/hooks/useDashboardStats"

type FiltersState = {
  project?: string
  dateFrom?: string
  dateTo?: string
}

type ProjectOption = {
  value: string
  label: string
}

export default function UserDashboard() {
  const [filters, setFilters] = useState<FiltersState>({
    project: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  })

  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const { data: taskData } = useUserTasks({
    project: filters.project,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })

  const filteredTaskData = taskData?.tasks ?? []

  useEffect(() => {
    if (!projectOptions.length) return

    const projectExists = projectOptions.some(
      (project) => project.value === filters.project
    )

    if (!filters.project || !projectExists) {
      setFilters((prev) => ({
        ...prev,
        project: projectOptions[0]?.value,
      }))
    }
  }, [filters.project, projectOptions])

  const { data, loading, error } = useDashboardStats(filters)

  useEffect(() => {
    if (!taskData?.tasks?.length) return

    const projectMap = new Map<string, string>()
    taskData.tasks.forEach((task) => {
      if (task.project?.id_project && task.project.name) {
        projectMap.set(task.project.id_project, task.project.name)
      }
    })

    const derivedProjectOptions = Array.from(projectMap.entries()).map(
      ([value, label]) => ({ value, label })
    )

    if (derivedProjectOptions.length) {
      setProjectOptions(derivedProjectOptions)

      if (!filters.project || !derivedProjectOptions.some((option) => option.value === filters.project)) {
        setFilters((prev) => ({
          ...prev,
          project: derivedProjectOptions[0].value,
        }))
      }
    }
  }, [taskData?.tasks, filters.project])

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-4">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

        <div className="w-full sm:w-auto">
          <Filters
            filters={filters}
            onChange={setFilters}
            projects={projectOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">

        <div className="flex flex-col gap-4 lg:col-span-2">

          <Card className="h-[450px] overflow-hidden">
            <CardContent className="h-full pt-4 overflow-y-auto overflow-x-hidden">
              <ProjectCard filters={filters} />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[200px]">
            <CardContent className="h-full pt-5">
              <TotalProgress
                dashboardData={data}
                projectId={filters.project}
                loading={loading}
                error={error}
              />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[246px] overflow-hidden">
            <CardContent className="h-full pt-5 flex items-center justify-center">
              <div className="w-full h-full">
                <Bugs />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">

          <Card className="h-auto lg:h-[450px]">
            <CardContent className="h-full pt-4">
              <TaskUser dashboardData={data} tasks={filteredTaskData} projectId={filters.project} loading={loading} error={error} />
            </CardContent>
          </Card>

          <Card className="h-auto lg:h-[462px]">
            <CardContent className="h-full pt-4">
              <WeeklyProg filters={filters} />
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}