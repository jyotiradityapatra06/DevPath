"use client"

import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((state) => state.isSidebarCollapsed)
  return (
    <div className="dark min-h-screen overflow-x-clip bg-[#09090B] text-[#FAFAFA]"><Sidebar /><MobileNavigation /><div className={cn("min-h-screen transition-[padding] duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}><Navbar /><main className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">{children}</main></div></div>
  )
}
