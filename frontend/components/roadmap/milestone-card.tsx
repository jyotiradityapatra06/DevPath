"use client"

import { CheckCircle2, CircleDot, Layers3 } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { ProjectMilestone } from "@/features/roadmap/types/roadmap"

export function MilestoneCard({ milestone, index }: { milestone: ProjectMilestone; index: number }) {
  const active = milestone.state === "in-progress"
  return <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileHover={{ y: -3 }} className={cn("rounded-3xl border bg-[#18181B]/75 p-5 transition-colors sm:p-6", active ? "border-[#8B5CF6]/25" : "border-white/[0.08] hover:border-white/[0.14]")}><div className="flex items-start justify-between gap-4"><div className={cn("grid size-10 place-items-center rounded-xl border", active ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]" : "border-white/10 bg-white/[0.03] text-[#71717A]")}><Layers3 className="size-4" /></div><span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]", active ? "text-[#C4B5FD]" : "text-[#71717A]")}>{milestone.state === "completed" ? <CheckCircle2 className="size-3.5" /> : <CircleDot className="size-3.5" />}{milestone.state.replace("-", " ")}</span></div><h3 className="mt-6 text-base font-semibold tracking-[-0.02em] text-white">{milestone.title}</h3><p className="mt-2 text-sm leading-6 text-[#71717A]">{milestone.description}</p><div className="mt-5 flex flex-wrap gap-2">{milestone.skills.map((skill) => <span key={skill} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] text-[#A1A1AA]">{skill}</span>)}</div><div className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] uppercase tracking-[0.14em] text-[#71717A]">Difficulty <span className="ml-2 text-[#F59E0B]">{milestone.difficulty}</span></div></motion.article>
}
