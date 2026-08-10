"use client"

import { motion } from "framer-motion"

export function ProgressIndicator({ value, label = "Journey progress" }: { value: number; label?: string }) {
  return (
    <div className="min-w-0" aria-label={`${label}: ${value}%`}>
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]"><span>{label}</span><span className="text-[#C4B5FD]">{value}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#10B981]" />
      </div>
    </div>
  )
}
