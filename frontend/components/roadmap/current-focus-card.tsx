"use client"

import { ArrowUpRight, Clock3, Crosshair, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function CurrentFocusCard() {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl border border-[#8B5CF6]/25 bg-[#18181B] p-6 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
      <div className="relative"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4B5FD]"><Crosshair className="size-4" />Your next best action</div><h2 className="mt-5 max-w-lg text-2xl font-semibold tracking-[-0.04em] text-white">Master FastAPI Authentication</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#A1A1AA]">High impact skill for your AI Engineer path. It unlocks secure API design and prepares you for production AI services.</p><div className="mt-7 flex flex-wrap gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#FCD34D]"><Zap className="size-3.5" />HIGH PRIORITY</span><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#D4D4D8]"><Clock3 className="size-3.5 text-[#10B981]" />2 weeks</span></div><div className="mt-7 flex items-center gap-2 text-xs font-medium text-[#C4B5FD]">Current stage objective <ArrowUpRight className="size-3.5" /></div></div>
    </motion.section>
  )
}
