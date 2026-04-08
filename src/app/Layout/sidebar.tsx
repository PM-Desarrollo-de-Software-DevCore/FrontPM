"use client"

import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
      <div className="flex pt-14">
        <Sidebar>
          <SidebarContent className="pt-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/dashboard"}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/project"}>
                  <FolderKanban className="w-4 h-4 mr-2" />
                  Project
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/milestone"}>
                  <Flag className="w-4 h-4 mr-2" />
                  Milestone
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/tasks"}>
                  <BookCheck className="w-4 h-4 mr-2" />
                  Tasks
                </SidebarMenuButton>
              </SidebarMenuItem>

                <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/workLogs"}>
                  <AlarmClockCheck className="w-4 h-4 mr-2" />
                  Work Logs
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/metrics"}>
                  <LandPlot className="w-4 h-4 mr-2" />
                  Metrics & Risks
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/settings"}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 pt-14">{children}</main>
      </div>
    </SidebarProvider>
  )
}