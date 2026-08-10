"use client"

import { ChevronLeft, LayoutGrid, Sparkles } from "lucide-react"
import Link from "next/link"

import { BrandMark } from "@/components/shared/brand-mark"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

export function Sidebar() {
  const collapsed = useUiStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex lg:flex-col", collapsed ? "w-20" : "w-64")}>
      <div className={cn("flex h-20 items-center", collapsed ? "justify-center" : "px-6")}><BrandMark inverse compact={collapsed} /></div>
      <nav className="flex-1 px-3 py-4" aria-label="Primary navigation">
        <Link href="/app" className={cn("flex h-11 items-center rounded-xl bg-white/10 text-sm font-medium text-white", collapsed ? "justify-center" : "gap-3 px-3")}><LayoutGrid className="size-4" />{!collapsed && "Workspace"}</Link>
        {!collapsed && <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"><Sparkles className="size-4 text-brand-cyan" /><p className="mt-3 text-sm font-medium">Foundation ready</p><p className="mt-1 text-xs leading-5 text-sidebar-foreground/55">Product modules will plug into this navigation shell.</p></div>}
      </nav>
      <div className="border-t border-sidebar-border p-3"><Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("text-sidebar-foreground hover:bg-white/10 hover:text-white", !collapsed && "w-full justify-start")}><ChevronLeft className={cn("transition-transform", collapsed && "rotate-180")} />{!collapsed && "Collapse"}</Button></div>
    </aside>
  )
}
