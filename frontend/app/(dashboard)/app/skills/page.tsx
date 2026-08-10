"use client"

import axios from "axios"
import { motion } from "framer-motion"
import { BrainCircuit, Sparkles, Target } from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { LearningRecommendation } from "@/components/skills/learning-recommendation"
import { SkillGapCard } from "@/components/skills/skill-gap-card"
import { SkillGraph } from "@/components/skills/skill-graph"
import { SkillOverviewCard } from "@/components/skills/skill-overview-card"
import { SkillSkeleton } from "@/components/skills/skill-skeleton"
import { SkillTimeline } from "@/components/skills/skill-timeline"
import { useSkillIntelligence } from "@/features/skills/hooks/use-skill-intelligence"
import { getApiErrorMessage } from "@/lib/api/client"

export default function SkillIntelligencePage() {
  const { data, error, isPending, isFetching, refetch } = useSkillIntelligence()

  if (isPending) return <SkillSkeleton />

  if (error || !data) {
    const missingProfile = axios.isAxiosError(error) && error.response?.status === 404
    return <SkillErrorState title={missingProfile ? "Complete your profile to generate skill intelligence." : "Skill intelligence is temporarily unavailable."} description={missingProfile ? "Choose a target role and add your current skills so DevPath can calculate your readiness." : getApiErrorMessage(error, "We couldn't load your skill analysis. Please try again.")} isRetrying={isFetching} onRetry={() => refetch()} />
  }

  if (data.nodes.length === 0) {
    return <SkillErrorState title="Your career intelligence analysis is being prepared." description="DevPath has your career target and will display its skill requirements as soon as the analysis is ready." isRetrying={isFetching} onRetry={() => refetch()} />
  }

  const currentSkills = data.nodes.filter((item) => item.state === "strong").slice(0, 3).map((item) => item.name)
  const nextSkills = data.gaps.slice(0, 3).map((item) => item.name)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-[90rem] space-y-7 sm:space-y-9">
      <header className="flex flex-col gap-6 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]"><BrainCircuit className="size-4" />Intelligence module</div><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Skill Intelligence</h1><p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">Understand where you are and what to learn next.</p></div>
        <div className="flex items-center gap-3"><div className="rounded-2xl border border-white/[0.08] bg-[#18181B] px-4 py-3"><p className="text-[9px] uppercase tracking-[0.14em] text-[#71717A]">Target</p><p className="mt-1 text-sm font-medium text-white">{data.targetRole}</p></div><div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.07] px-4 py-3"><p className="text-[9px] uppercase tracking-[0.14em] text-[#6EE7B7]">Career readiness</p><p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">{Math.round(data.summary.readinessScore)}%</p></div></div>
      </header>

      <SkillOverviewCard summary={data.summary} />
      <SkillGraph nodes={data.nodes} connections={data.connections} targetRole={data.targetRole} />

      <section>
        <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">Gap analysis</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Your Career Skill Gaps</h2><p className="mt-2 text-sm text-[#71717A]">The highest-impact differences between your current signal and target role.</p></div>
        {data.gaps.length > 0 ? <div className="grid gap-4 lg:grid-cols-2">{data.gaps.map((gap, index) => <SkillGapCard key={gap.name} gap={gap} index={index} />)}</div> : <div className="rounded-3xl border border-[#10B981]/20 bg-[#10B981]/[0.06] p-7 text-sm text-[#A7F3D0]">You currently meet all mapped skill requirements for {data.targetRole}.</div>}
      </section>

      <DashboardCard title="Recommended Next Steps" description="Focused learning moves ranked by career impact" action={<Sparkles className="size-5 text-[#A78BFA]" />}>
        {data.recommendations.length > 0 ? data.recommendations.map((recommendation, index) => <LearningRecommendation key={`${recommendation.title}-${index}`} recommendation={recommendation} index={index} />) : <p className="p-6 text-sm text-[#71717A]">No additional learning actions are currently recommended.</p>}
      </DashboardCard>

      <DashboardCard title="Skill Growth Timeline" description="From current capability to target-role readiness" action={<Target className="size-5 text-[#F59E0B]" />}>
        <SkillTimeline currentSkills={currentSkills} nextSkills={nextSkills} targetRole={data.targetRole} />
      </DashboardCard>
    </motion.div>
  )
}

function SkillErrorState({ title, description, isRetrying, onRetry }: { title: string; description: string; isRetrying: boolean; onRetry: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center"><div className="w-full rounded-3xl border border-white/[0.08] bg-[#18181B] p-8 text-center sm:p-10"><BrainCircuit className="mx-auto size-8 text-[#A78BFA]" /><h1 className="mt-5 text-2xl font-semibold text-white">{title}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#A1A1AA]">{description}</p><button type="button" onClick={onRetry} disabled={isRetrying} className="mt-7 rounded-xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9D74F7] disabled:opacity-60">{isRetrying ? "Trying again..." : "Try again"}</button></div></div>
  )
}
