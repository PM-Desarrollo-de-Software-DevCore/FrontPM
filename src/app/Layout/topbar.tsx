"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getUserCompletedTodayCount } from "@/services/taskService"
import FramedAvatar from "@/components/ui/avatar/FramedAvatar"
import { getUserProfileDetails } from "@/services/userService"
import NotificationCenter from "@/components/ui/notifications/NotificationCenter"
import GlobalSearchBar from "@/components/Layout/GlobalSearchBar"

export default function Topbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  const fullName = [user?.name, user?.lastname].filter(Boolean).join(" ") || "Usuario"
  const [completedToday, setCompletedToday] = useState<number>(0)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      if (!user) return
      try {
        const count = await getUserCompletedTodayCount()
        if (!cancelled) setCompletedToday(count)
      } catch (err) {
        console.error(err)
      }
    }

    fetchCount()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function fetchProfileImage() {
      if (!user?.id) {
        setProfileImageUrl(null)
        return
      }

      try {
        const details = await getUserProfileDetails(user.id)
        if (!cancelled) setProfileImageUrl(details.profileImageUrl)
      } catch {
        if (!cancelled) setProfileImageUrl(null)
      }
    }

    fetchProfileImage()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sidebar-border bg-sidebar shadow-sm">
      
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">

        <div className="flex items-center">
          <Image
            src="/images/logo/TM_Logo_Color_Pos_RGB.png"
            alt="FrontPM Logo"
            width={120}
            height={30}
            className="object-contain sm:w-37.5"
          />
        </div>

 
        <div className="flex items-center gap-3 sm:gap-6">

     
          <GlobalSearchBar />

          <NotificationCenter />


          <div className="flex items-center gap-2 sm:gap-3">

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-sidebar-foreground">
                {fullName}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                {user?.email || ""}
              </p>
            </div>

            <div className="relative">
                <button type="button" onClick={() => setOpen(!open)} className="block">
                  <FramedAvatar
                    src={profileImageUrl ?? user?.avatar ?? "/images/persona.png"}
                    alt="User"
                    size={36}
                    completedTodayCount={completedToday}
                    priority
                  />
                </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">

                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-xl"
                    onClick={() => {
                      router.push("/profile")
                      setOpen(false)
                    }}
                  >
                    View Profile
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-b-xl"
                    onClick={() => {
                      logout()
                      router.replace("/login")
                      setOpen(false)
                    }}
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}