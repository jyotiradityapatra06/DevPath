"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Bot, LayoutGrid, Route, Workflow, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandMark } from "@/components/shared/brand-mark"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

export function MobileNavigation() {
  const open = useUiStore((state) => state.isMobileNavigationOpen)
  const setOpen = useUiStore((state) => state.setMobileNavigationOpen)
  const pathname = usePathname()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(86vw,20rem)] border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center justify-between"><BrandMark inverse /><Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close navigation" className="text-white hover:bg-white/10 hover:text-white"><X /></Button></Dialog.Close></div>
          <nav className="mt-10 space-y-1">{[{ label: "Overview", href: "/app", icon: LayoutGrid }, { label: "Skill intelligence", href: "/app/skills", icon: Workflow }, { label: "Roadmap", href: "/app/roadmap", icon: Route }, { label: "AI Coach", href: "/app/coach", icon: Bot }].map(({ label, href, icon: Icon }) => <Dialog.Close asChild key={label}><Link href={href} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium", pathname === href ? "bg-white/10 text-white" : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-white")}><Icon className="size-4" />{label}</Link></Dialog.Close>)}</nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
