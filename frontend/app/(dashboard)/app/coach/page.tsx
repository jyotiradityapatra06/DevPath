"use client"

import { motion } from "framer-motion"

import { CoachChat } from "@/components/coach/coach-chat"
import { CoachHeader } from "@/components/coach/coach-header"
import { ContextPanel } from "@/components/coach/context-panel"
import { InsightCard } from "@/components/coach/insight-card"
import { careerInsights } from "@/features/coach/data/mock-coach"

export default function CoachPage() {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-[90rem] space-y-8"><CoachHeader /><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"><CoachChat /><ContextPanel /></div><section><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">Intelligence signals</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Career Insights</h2><p className="mt-2 text-sm text-[#71717A]">Personalized observations derived from your current profile.</p></div><div className="grid gap-4 lg:grid-cols-3">{careerInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} />)}</div></section></motion.div>
}
