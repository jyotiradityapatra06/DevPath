"use client"

import { Bot, ChevronLeft, LayoutGrid, Route, Sparkles, Workflow } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandMark } from "@/components/shared/brand-mark"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

export function Sidebar() {
  const collapsed = useUiStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const pathname = usePathname()
  const navigation = [
    { label: "Overview", href: "/app", icon: LayoutGrid },
    { label: "Skill intelligence", href: "/app/skills", icon: Workflow },
    { label: "Roadmap", href: "/app/roadmap", icon: Route },
    { label: "AI Coach", href: "/app/coach", icon: Bot },
  ]

  return (
    <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex lg:flex-col", collapsed ? "w-20" : "w-64")}>
      <div className={cn("flex h-20 items-center", collapsed ? "justify-center" : "px-6")}><BrandMark inverse compact={collapsed} /></div>
      <nav className="flex-1 px-3 py-4" aria-label="Primary navigation">
        <div className="space-y-1">{navigation.map(({ label, href, icon: Icon }) => { const active = pathname === href; return <Link key={label} href={href} title={collapsed ? label : undefined} className={cn("relative flex h-11 items-center overflow-hidden rounded-xl text-sm font-medium transition-colors", collapsed ? "justify-center" : "gap-3 px-3", active ? "text-white" : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-white")}>{active && <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl border border-white/[0.06] bg-white/[0.09]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}<Icon className="relative size-4" />{!collapsed && <span className="relative">{label}</span>}</Link> })}</div>
        {!collapsed && <div className="mt-8 rounded-2xl border border-[#8B5CF6]/15 bg-[#8B5CF6]/[0.06] p-4"><Sparkles className="size-4 text-[#A78BFA]" /><p className="mt-3 text-sm font-medium text-white">AI signal active</p><p className="mt-1 text-xs leading-5 text-sidebar-foreground/45">Your guidance reflects your latest career context.</p></div>}
      </nav>
      <div className="border-t border-sidebar-border p-3"><Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("text-sidebar-foreground hover:bg-white/10 hover:text-white", !collapsed && "w-full justify-start")}><ChevronLeft className={cn("transition-transform", collapsed && "rotate-180")} />{!collapsed && "Collapse"}</Button></div>
    </motion.aside>
  )
}
