"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"

export function TypingIndicator() {
  return <motion.div animate={{ opacity: [0.82, 1, 0.82] }} transition={{ duration: 2.2, repeat: Infinity }} className="flex items-center gap-3" aria-label="AI is analyzing"><div className="grid size-8 place-items-center rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]"><Bot className="size-4" /></div><div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#18181B] px-4 py-3"><span className="text-xs text-[#A1A1AA]">AI is analyzing</span><span className="flex gap-1">{[0, 1, 2].map((dot) => <motion.span key={dot} animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.16 }} className="size-1.5 rounded-full bg-[#A78BFA]" />)}</span></div></motion.div>
}
