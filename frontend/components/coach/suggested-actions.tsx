"use client"

import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

import type { SuggestedAction } from "@/features/coach/types/coach"

export function SuggestedActions({ actions, onSelect }: { actions: readonly SuggestedAction[]; onSelect: (action: string) => void }) {
  return <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#71717A]">Suggested actions</p><div className="flex flex-wrap gap-2">{actions.map((action, index) => <motion.button key={`${action.label}-${action.action}`} type="button" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + index * 0.05 }} whileHover={{ y: -1 }} onClick={() => onSelect(action.action)} className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 py-2 text-xs text-[#A1A1AA] transition-colors hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/[0.06] hover:text-white">{action.label}<ArrowUpRight className="size-3 text-[#71717A] transition-colors group-hover:text-[#A78BFA]" /></motion.button>)}</div></div>
}
