"use client"

import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

import { PriorityBadge } from "@/components/skills/priority-badge"
import type { SkillGap } from "@/features/skills/types/skill-intelligence"

export function SkillGapCard({ gap, index = 0 }: { gap: SkillGap; index?: number }) {
  const difference = gap.required - gap.current
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileHover={{ y: -2 }} className="rounded-3xl border border-white/[0.08] bg-[#18181B]/75 p-5 shadow-[0_20px_60px_-48px_rgba(139,92,246,0.25)] transition-[border-color,box-shadow] hover:border-[#8B5CF6]/20 hover:shadow-[0_24px_65px_-42px_rgba(139,92,246,0.32)] sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-lg font-semibold tracking-[-0.025em] text-white">{gap.name}</p><p className="mt-1 text-xs text-[#71717A]">Target-role requirement</p></div><PriorityBadge priority={gap.priority} /></div>
      <div className="mt-8 grid grid-cols-3 gap-3"><div><p className="text-[10px] uppercase tracking-[0.12em] text-[#71717A]">Current</p><p className="mt-2 text-xl font-semibold text-[#A78BFA]">{gap.current}%</p></div><div><p className="text-[10px] uppercase tracking-[0.12em] text-[#71717A]">Required</p><p className="mt-2 text-xl font-semibold text-white">{gap.required}%</p></div><div><p className="text-[10px] uppercase tracking-[0.12em] text-[#71717A]">Gap</p><p className="mt-2 text-xl font-semibold text-[#FBBF24]">{difference}%</p></div></div>
      <div className="relative mt-6 h-7"><div className="absolute inset-x-0 top-3 h-px bg-white/10" /><motion.div initial={{ width: 0 }} whileInView={{ width: `${gap.current}%` }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="absolute left-0 top-3 h-px bg-[#8B5CF6]" /><span className="absolute top-1.5 size-3 -translate-x-1/2 rounded-full border-2 border-[#18181B] bg-[#8B5CF6]" style={{ left: `${gap.current}%` }} /><span className="absolute top-1 size-4 -translate-x-1/2 rounded-full border border-[#F59E0B]/60 bg-[#18181B]" style={{ left: `${gap.required}%` }} /></div>
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#111113] p-4"><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-[#F59E0B]" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">Recommended action</p><p className="mt-2 text-xs leading-5 text-[#A1A1AA]">{gap.action}</p></div></div>
    </motion.article>
  )
}
