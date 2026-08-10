"use client"

import { Bot, UserRound } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { CoachMessage } from "@/features/coach/types/coach"

export function MessageBubble({ message, index }: { message: CoachMessage; index: number }) {
  const assistant = message.role === "assistant"
  return <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className={cn("flex gap-3", !assistant && "flex-row-reverse")}><div className={cn("grid size-8 shrink-0 place-items-center rounded-xl border", assistant ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]" : "border-white/10 bg-white/[0.05] text-[#D4D4D8]")}>{assistant ? <Bot className="size-4" /> : <UserRound className="size-4" />}</div><div className={cn("max-w-[85%] sm:max-w-[78%]", !assistant && "text-right")}><div className={cn("rounded-2xl px-4 py-3 text-left text-sm leading-6", assistant ? "rounded-tl-md border border-white/[0.08] bg-[#18181B] text-[#D4D4D8]" : "rounded-tr-md bg-[#8B5CF6] text-white shadow-[0_12px_35px_-20px_rgba(139,92,246,0.65)]")}>{message.content}</div><p className="mt-1.5 px-1 text-[10px] text-[#52525B]">{assistant ? "DevPath Coach" : "You"} · {message.timestamp}</p></div></motion.article>
}
