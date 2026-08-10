"use client"

import { useState } from "react"
import { Check, ChevronDown, Clock3, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { ProgressIndicator } from "@/components/roadmap/progress-indicator"
import { cn } from "@/lib/utils"
import type { RoadmapStageData } from "@/features/roadmap/types/roadmap"

const statusLabels = { completed: "Completed", current: "In progress", upcoming: "Upcoming" }

export function RoadmapStage({ stage, index }: { stage: RoadmapStageData; index: number }) {
  const [expanded, setExpanded] = useState(stage.status === "current")
  const completed = stage.status === "completed"
  const current = stage.status === "current"

  return (
    <motion.article initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: index * 0.08, duration: 0.4 }} className="relative pl-12 sm:pl-16">
      <div className={cn("absolute left-[11px] top-7 z-10 grid size-7 place-items-center rounded-full border sm:left-[15px]", completed && "border-[#10B981]/50 bg-[#10B981] text-[#071A13]", current && "border-[#8B5CF6]/60 bg-[#18181B] text-[#C4B5FD] shadow-[0_0_24px_rgba(139,92,246,0.25)]", stage.status === "upcoming" && "border-white/15 bg-[#111113] text-[#52525B]")}>{completed ? <Check className="size-4" /> : current ? <Sparkles className="size-3.5" /> : <span className="text-[10px] font-semibold">{stage.id}</span>}</div>
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className={cn("w-full rounded-3xl border bg-[#18181B]/75 p-5 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-46px_rgba(139,92,246,0.3)] active:translate-y-0 sm:p-6", current ? "border-[#8B5CF6]/25 hover:border-[#8B5CF6]/40" : "border-white/[0.08] hover:border-white/[0.14]")}>
        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">Stage {stage.id}</span><span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]", completed ? "border-[#10B981]/25 bg-[#10B981]/10 text-[#6EE7B7]" : current ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]" : "border-white/10 bg-white/[0.03] text-[#71717A]")}>{statusLabels[stage.status]}</span></div><h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white sm:text-xl">{stage.title}</h3><p className="mt-1 text-sm text-[#71717A]">{stage.description}</p></div><ChevronDown className={cn("mt-1 size-4 shrink-0 text-[#71717A] transition-transform", expanded && "rotate-180")} /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"><ProgressIndicator value={stage.completion} label="Completion" /><div className="flex items-center gap-2 text-xs text-[#A1A1AA]"><Clock3 className="size-3.5 text-[#F59E0B]" />{stage.duration}</div></div>
      </button>
      <AnimatePresence initial={false}>{expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><div className="mx-2 border-x border-b border-white/[0.07] bg-[#111113]/70 px-5 py-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">Skills in this stage</p><div className="flex flex-wrap gap-2">{stage.skills.map((skill) => <span key={skill} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#D4D4D8]">{skill}</span>)}</div></div></motion.div>}</AnimatePresence>
    </motion.article>
  )
}
