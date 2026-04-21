"use client"

import { usePathname } from "next/navigation"
import type { ComponentType } from "react"
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
  AlarmClockCheck,
  Flag,
  UserCircle2,
  UserPlus
} from "lucide-react"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { getDashboardRouteByRole } from "@/lib/auth"

type SidebarRole = "project_manager" | "scrum_master" | "user" 

type SidebarItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  roles: SidebarRole[]
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["project_manager", "scrum_master", "user"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["project_manager", "scrum_master", "user"],
  },
  {
    label: "Milestones",
    href: "/milestones",
    icon: Flag,
    roles: ["scrum_master", "user"],
  },
  {
    label: "Work Logs",
    href: "/worklogs",
    icon: AlarmClockCheck,
    roles: ["project_manager", "scrum_master", "user"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserCircle2,
    roles: ["project_manager", "scrum_master", "user"],
  },
  {
  label: "Create User",
  href: "/users/create",
  icon: UserPlus,
  roles: ["project_manager"],
  },
]



export default function SideBarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const dashboardPath = getDashboardRouteByRole(user?.role)
  const currentRole = user?.role as SidebarRole | undefined

  const visibleItems = sidebarItems.filter((item) => {
    if (!currentRole) {
      return false
    }

    return item.roles.includes(currentRole)
  })

  const isPathActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === dashboardPath || pathname.startsWith(`${dashboardPath}/`)
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <SidebarProvider>
      <div className="flex pt-14">
        <Sidebar>
          <SidebarContent className="pt-3">
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon
                const href = item.label === "Dashboard" ? dashboardPath : item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isPathActive(item.href)}>
                      <Link href={href}>
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 pt-4">{children}</main>
      </div>
    </SidebarProvider>
  )
}