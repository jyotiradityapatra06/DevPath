"use client"

import { Bell, LogOut, Menu } from "lucide-react"
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
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#09090B]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:bg-white/5 hover:text-white lg:hidden" onClick={() => openMobileNavigation(true)} aria-label="Open navigation"><Menu /></Button><div><p className="text-sm font-semibold text-white">Career workspace</p><p className="hidden text-xs text-[#71717A] sm:block">Intelligence for your next move.</p></div></div>
      <div className="flex items-center gap-1 sm:gap-2"><Button variant="ghost" size="icon" aria-label="Notifications" className="text-[#71717A] hover:bg-white/5 hover:text-white"><Bell /></Button><Avatar><AvatarFallback className="bg-[#8B5CF6]/15 font-semibold text-[#C4B5FD]">JM</AvatarFallback></Avatar><Button variant="ghost" size="icon" onClick={handleLogout} disabled={isSigningOut} aria-label="Sign out" className="text-[#71717A] hover:bg-white/5 hover:text-white"><LogOut /></Button></div>
    </header>
  )
}
