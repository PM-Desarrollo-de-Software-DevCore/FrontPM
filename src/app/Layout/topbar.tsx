"use client"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../../components/ui/topbar/navigation-menu"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Topbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sidebar-border bg-sidebar shadow-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 -ml-5">
            <Image src="/images/logo/TM_Logo_Color_Pos_RGB.png" alt="FrontPM Logo" width={150} height={36} className="rounded-lg object-cover" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center border border-sidebar-border rounded-xl px-3 py-2 w-80 bg-background">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 10.5a6.15 6.15 0 11-12.3 0 6.15 6.15 0 0112.3 0z" />
            </svg>

            <input
              type="text"
              placeholder="Search for anything..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>
  
          <button className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-sidebar-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405M19 17V11a7 7 0 10-14 0v6l-1.405 1.405M5 17h14" />
            </svg>

            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-sidebar-foreground">
                Anima Agrawal
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                U.P, India
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
                      console.log("Logout")
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