"use client"

import { motion } from "framer-motion"
import { useState } from "react"

import { CoachChat } from "@/components/coach/coach-chat"
import { CoachHeader } from "@/components/coach/coach-header"
import { ContextPanel } from "@/components/coach/context-panel"
import { InsightCard } from "@/components/coach/insight-card"
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview"
import type { CoachContext, CoachInsight, SuggestedAction } from "@/features/coach/types/coach"

export default function CoachPage() {
  const dashboard = useDashboardOverview()
  const [insights, setInsights] = useState<CoachInsight[]>([])
  const context: CoachContext | null = dashboard.data ? {
    targetRole: dashboard.data.career.targetRole,
    experienceLevel: dashboard.data.career.experienceLevel,
    skills: [...dashboard.data.skills.strongSkills, ...dashboard.data.skills.improvementAreas].slice(0, 5).map((item) => item.name),
    roadmapProgress: dashboard.data.roadmap.progress,
    currentFocus: dashboard.data.roadmap.currentStep ?? dashboard.data.aiInsight.focusArea,
  } : null
  const initialActions: SuggestedAction[] = context ? [
    { label: "Analyze my skill gaps", action: `Analyze my most important skill gaps for becoming a ${context.targetRole}.` },
    { label: "Improve my roadmap", action: `Review my ${context.targetRole} roadmap and recommend the next best step.` },
    { label: "Suggest a project", action: `Suggest a practical project for my current ${context.experienceLevel} level.` },
  ] : []

  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-[90rem] space-y-8"><CoachHeader context={context} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"><CoachChat initialActions={initialActions} onInsightsChange={setInsights} /><ContextPanel context={context} /></div><section><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">Intelligence signals</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Career Insights</h2><p className="mt-2 text-sm text-[#71717A]">Personalized observations derived from your current profile.</p></div>{insights.length > 0 ? <div className="grid gap-4 lg:grid-cols-3">{insights.map((insight, index) => <InsightCard key={`${insight.title}-${index}`} insight={insight} index={index} />)}</div> : <div className="rounded-3xl border border-white/[0.08] bg-[#18181B]/75 p-7 text-sm text-[#71717A]">Ask your coach a question to generate a personalized career insight.</div>}</section></motion.div>
}
