"use client"

import { LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useUiStore } from "@/stores/ui-store"

export function Navbar() {
  const router = useRouter()
  const { logout } = useAuth()
  const openMobileNavigation = useUiStore((state) => state.setMobileNavigationOpen)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleLogout() {
    setIsSigningOut(true)
    try {
      await logout()
      router.replace("/login")
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => openMobileNavigation(true)} aria-label="Open navigation"><Menu /></Button><div><p className="text-sm font-semibold">Your workspace</p><p className="hidden text-xs text-muted-foreground sm:block">A calm foundation for focused progress.</p></div></div>
      <div className="flex items-center gap-2"><Avatar><AvatarFallback className="bg-primary/10 font-semibold text-primary">DP</AvatarFallback></Avatar><Button variant="ghost" size="icon" onClick={handleLogout} disabled={isSigningOut} aria-label="Sign out"><LogOut /></Button></div>
    </header>
  )
}
