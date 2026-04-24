"use client"

import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "../../components/ui/sidebar/sidebar"

import { 
  LayoutDashboard, 
  FolderKanban, 
  Flag, 
  BookCheck, 
  AlarmClockCheck, 
  LandPlot, 
  Settings 
} from "lucide-react"

import Link from "next/link"

export default function SideBarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex w-full overflow-hidden pt-14">
        <Sidebar>
          <SidebarContent className="pt-3">
            <SidebarMenu>

              <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton isActive={pathname === "/dashboard"}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/project">
                  <SidebarMenuButton isActive={pathname === "/project"}>
                    <FolderKanban className="w-4 h-4 mr-2" />
                    Project
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/milestone">
                  <SidebarMenuButton isActive={pathname === "/milestone"}>
                    <Flag className="w-4 h-4 mr-2" />
                    Milestone
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/tasks">
                  <SidebarMenuButton isActive={pathname === "/tasks"}>
                    <BookCheck className="w-4 h-4 mr-2" />
                    Tasks
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/worklogs">
                  <SidebarMenuButton isActive={pathname === "/worklogs"}>
                    <AlarmClockCheck className="w-4 h-4 mr-2" />
                    Work Logs
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/metrics">
                  <SidebarMenuButton isActive={pathname === "/metrics"}>
                    <LandPlot className="w-4 h-4 mr-2" />
                    Metrics & Risks
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton isActive={pathname === "/settings"}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-x-hidden pt-14">{children}</main>
      </div>
    </SidebarProvider>
  )
}