"use client"

import { motion } from "framer-motion"
import { ArrowRight, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api/client"

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      })
      router.replace("/app")
      router.refresh()
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to create your account."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className="text-sm font-medium text-primary">Start your path</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Create your workspace</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Set the foundation for a career plan built around you.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium">Full name</label><Input id="name" name="name" autoComplete="name" required placeholder="Ada Lovelace" className="h-11 bg-card px-3" /></div>
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email address</label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-11 bg-card px-3" /></div>
        <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Password</label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} className="h-11 bg-card px-3" /><p className="text-xs text-muted-foreground">Use 8–72 characters.</p></div>
        {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="animate-spin" /> : <>Create account <ArrowRight /></>}</Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-foreground hover:text-primary">Sign in</Link></p>
    </motion.div>
  )
}
