"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Sparkles, Target } from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { LearningRecommendation } from "@/components/skills/learning-recommendation"
import { SkillGapCard } from "@/components/skills/skill-gap-card"
import { SkillGraph } from "@/components/skills/skill-graph"
import { SkillOverviewCard } from "@/components/skills/skill-overview-card"
import { SkillTimeline } from "@/components/skills/skill-timeline"
import {
  learningSteps,
  skillConnections,
  skillGaps,
  skillNodes,
} from "@/features/skills/data/mock-skill-intelligence"

export default function SkillIntelligencePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-[90rem] space-y-7 sm:space-y-9">
      <header className="flex flex-col gap-6 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]"><BrainCircuit className="size-4" />Intelligence module</div><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Skill Intelligence</h1><p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">Understand where you are and what to learn next.</p></div>
        <div className="flex items-center gap-3"><div className="rounded-2xl border border-white/[0.08] bg-[#18181B] px-4 py-3"><p className="text-[9px] uppercase tracking-[0.14em] text-[#71717A]">Target</p><p className="mt-1 text-sm font-medium text-white">AI Engineer</p></div><div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.07] px-4 py-3"><p className="text-[9px] uppercase tracking-[0.14em] text-[#6EE7B7]">Career readiness</p><p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">78%</p></div></div>
      </header>

      <SkillOverviewCard />
      <SkillGraph nodes={skillNodes} connections={skillConnections} />

      <section>
        <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">Gap analysis</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Your Career Skill Gaps</h2><p className="mt-2 text-sm text-[#71717A]">The highest-impact differences between your current signal and target role.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">{skillGaps.map((gap, index) => <SkillGapCard key={gap.name} gap={gap} index={index} />)}</div>
      </section>

      <DashboardCard title="Recommended Next Steps" description="Focused learning moves ranked by career impact" action={<Sparkles className="size-5 text-[#A78BFA]" />}>
        {learningSteps.map((recommendation, index) => <LearningRecommendation key={recommendation.title} recommendation={recommendation} index={index} />)}
      </DashboardCard>

      <DashboardCard title="Skill Growth Timeline" description="From current capability to target-role readiness" action={<Target className="size-5 text-[#F59E0B]" />}>
        <SkillTimeline />
      </DashboardCard>
    </motion.div>
  )
}
