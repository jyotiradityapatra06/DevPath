"use client"

import { BrainCircuit, Lightbulb, Rocket } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { CoachInsight } from "@/features/coach/types/coach"

const badgeStyles = { High: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD34D]", Recommended: "border-[#10B981]/25 bg-[#10B981]/10 text-[#6EE7B7]", Strategic: "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]" }

export function InsightCard({ insight, index }: { insight: CoachInsight; index: number }) {
  const Icon = insight.title.toLowerCase().includes("project") ? Rocket : insight.title.toLowerCase().includes("learning") ? Lightbulb : BrainCircuit
  return <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} whileHover={{ y: -2 }} className="rounded-2xl border border-white/[0.08] bg-[#18181B]/75 p-5 transition-colors hover:border-white/[0.14]"><div className="flex items-start justify-between gap-3"><div className="grid size-9 place-items-center rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.08] text-[#A78BFA]"><Icon className="size-4" /></div><span className={cn("rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]", badgeStyles[insight.priority])}>{insight.priority}</span></div><h3 className="mt-5 text-sm font-semibold text-white">{insight.title}</h3><p className="mt-2 text-xs leading-5 text-[#A1A1AA]">{insight.description}</p></motion.article>
}
