"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"

export default function Topbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  const fullName = [user?.name, user?.lastname].filter(Boolean).join(" ") || "Usuario"

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

     
          <div className="hidden md:flex items-center border border-sidebar-border rounded-xl px-3 py-2 w-64 lg:w-80 bg-background">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.65 10.5a6.15 6.15 0 11-12.3 0 6.15 6.15 0 0112.3 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>

          <button className="relative">
            <NotificationsNoneOutlinedIcon className="h-5 w-5 text-sidebar-foreground" />

            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>


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
              <Image
                src="/images/persona.png"
                alt="User"
                width={36}
                height={36}
                onClick={() => setOpen(!open)}
                className="rounded-full cursor-pointer"
              />

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