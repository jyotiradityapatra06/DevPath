"use client"

import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((state) => state.isSidebarCollapsed)
  return (
    <div className="min-h-screen"><Sidebar /><MobileNavigation /><div className={cn("min-h-screen transition-[padding] duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}><Navbar /><main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div></div>
  )
}
