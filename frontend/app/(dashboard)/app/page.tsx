"use client"

import { motion } from "framer-motion"
import { Boxes, CheckCircle2, Layers3 } from "lucide-react"

const foundation = [
  { icon: Layers3, label: "Scalable application shell" },
  { icon: CheckCircle2, label: "Secure session foundation" },
  { icon: Boxes, label: "Feature-ready architecture" },
]

export default function WorkspacePage() {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl">
      <div className="glass-panel overflow-hidden rounded-3xl p-7 sm:p-10">
        <span className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">Frontend foundation</span>
        <h1 className="mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">The DevPath workspace is ready to grow.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Authentication, data access, state providers, design tokens, and responsive navigation are now composed into a production-ready shell.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">{foundation.map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border bg-card/70 p-4"><Icon className="size-5 text-primary" /><p className="mt-4 text-sm font-medium">{label}</p></div>)}</div>
      </div>
    </motion.section>
  )
}
