"use client"

import { motion } from "framer-motion"
import { ArrowRight, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api/client"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)

    try {
      await login({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      })
      router.replace("/app")
      router.refresh()
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to sign in. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className="text-sm font-medium text-primary">Welcome back</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Sign in to DevPath</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Continue building momentum toward your next role.</p>
      {searchParams.get("reason") === "session-expired" && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Your session expired. Sign in again to continue.</p>
      )}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email address</label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className="h-11 bg-card px-3" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Password</label><span className="text-xs text-muted-foreground">8+ characters</span></div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className="h-11 bg-card px-3" />
        </div>
        {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : <>Sign in <ArrowRight /></>}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">New to DevPath? <Link href="/register" className="font-semibold text-foreground hover:text-primary">Create an account</Link></p>
    </motion.div>
  )
}
