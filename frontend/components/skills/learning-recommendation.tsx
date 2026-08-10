"use client"

import { ArrowUpRight, Clock3 } from "lucide-react"
import { motion } from "framer-motion"

import { PriorityBadge } from "@/components/skills/priority-badge"
import type { LearningRecommendation as LearningRecommendationData } from "@/features/skills/types/skill-intelligence"

export function LearningRecommendation({ recommendation, index }: { recommendation: LearningRecommendationData; index: number }) {
  return (
    <motion.article initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className="group grid gap-5 border-b border-white/[0.07] px-5 py-6 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
      <span className="grid size-10 place-items-center rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-sm font-semibold text-[#A78BFA]">{String(index + 1).padStart(2, "0")}</span>
      <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-white">{recommendation.title}</h3><span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-[#71717A]">{recommendation.category}</span></div><p className="mt-2 text-xs leading-5 text-[#71717A]">{recommendation.reason}</p></div>
      <div className="flex items-center justify-between gap-6 sm:justify-end"><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#52525B]">Impact</p><div className="mt-1"><PriorityBadge priority={recommendation.impact} /></div></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#52525B]">Estimated</p><p className="mt-2 flex items-center gap-1.5 text-xs text-[#A1A1AA]"><Clock3 className="size-3.5" />{recommendation.estimate}</p></div><ArrowUpRight className="size-4 text-[#3F3F46] transition-colors group-hover:text-[#A78BFA]" /></div>
    </motion.article>
  )
}
