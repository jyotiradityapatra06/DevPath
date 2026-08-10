"use client"

import axios from "axios"
import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit, Compass, Gauge, GraduationCap, Route, Sparkles, Target } from "lucide-react"

import { AIInsightCard } from "@/components/dashboard/ai-insight-card"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { MetricCard } from "@/components/dashboard/metric-card"
import { SkillBadge } from "@/components/dashboard/skill-badge"
import { Timeline, type TimelineItem } from "@/components/dashboard/timeline"
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview"
import { getApiErrorMessage } from "@/lib/api/client"

const skillColors = ["bg-[#10B981]", "bg-[#8B5CF6]", "bg-[#F59E0B]"]
const nodePositions = ["left-[8%] top-[15%]", "right-[7%] top-[20%]", "bottom-[16%] left-[7%]", "bottom-[18%] right-[6%]"]

export default function DashboardPage() {
  const { data, error, isPending, refetch, isFetching } = useDashboardOverview()

  if (isPending) return <DashboardSkeleton />

  if (error || !data) {
    const missingProfile = axios.isAxiosError(error) && error.response?.status === 404
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center">
        <div className="w-full rounded-3xl border border-white/[0.08] bg-[#18181B] p-8 text-center sm:p-10">
          <BrainCircuit className="mx-auto size-8 text-[#A78BFA]" />
          <h1 className="mt-5 text-2xl font-semibold text-white">{missingProfile ? "Complete your profile to unlock career intelligence." : "Your dashboard is temporarily unavailable."}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#A1A1AA]">{missingProfile ? "DevPath needs your career goal and skills before it can calculate your personalized signal." : getApiErrorMessage(error, "We couldn't load your career data. Please try again.")}</p>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-7 rounded-xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9D74F7] disabled:opacity-60">{isFetching ? "Trying again..." : "Try again"}</button>
        </div>
      </div>
    )
  }

  const nextFocus = data.roadmap.nextMilestone ?? data.aiInsight.focusArea
  const metrics = [
    { label: "Career goal", value: data.career.targetRole, detail: data.career.careerGoal, icon: Target, accent: "violet" as const },
    { label: "AI readiness", value: `${Math.round(data.career.readinessScore)}%`, detail: `${data.skills.completedSkills} of ${data.skills.totalSkills} target skills completed`, icon: Gauge, accent: "emerald" as const },
    { label: "Current level", value: data.career.experienceLevel, detail: data.career.currentStage, icon: GraduationCap, accent: "neutral" as const },
    { label: "Recommended next", value: nextFocus, detail: "Highest-impact capability", icon: Compass, accent: "amber" as const },
  ]
  const timeline: TimelineItem[] = [
    { stage: "Current", title: data.roadmap.currentStep ?? "Roadmap not started", description: data.roadmap.totalSteps > 0 ? `${data.roadmap.completedSteps} of ${data.roadmap.totalSteps} steps completed.` : "Your career profile is ready for a roadmap.", status: "active" },
    { stage: "Next", title: data.roadmap.nextMilestone ?? data.aiInsight.focusArea, description: "Your next highest-value growth milestone.", status: "next" },
    { stage: "Future", title: `${data.career.targetRole} readiness`, description: `Build toward your ${data.career.targetRole} career goal.`, status: "future" },
  ]
  const skillProgress = [...data.skills.strongSkills, ...data.skills.improvementAreas].slice(0, 3)
  const graphSkills = [...data.skills.strongSkills, ...data.skills.improvementAreas].slice(0, 4)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mx-auto max-w-[90rem] space-y-6 sm:space-y-8">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-28 -top-32 size-96 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-[18%] size-56 rounded-full bg-[#10B981]/[0.07] blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#A1A1AA]"><span className="size-1.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />Career signal updated today</div><h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">Welcome back, {data.user.name}</h1><p className="mt-4 text-base text-[#A1A1AA] sm:text-lg">Your AI career journey is evolving.</p></div>
          <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.07] p-4"><Sparkles className="mt-0.5 size-4 shrink-0 text-[#A78BFA]" /><p className="text-xs leading-5 text-[#A1A1AA]"><span className="font-medium text-white">AI insight:</span> {data.aiInsight.recommendations[0]}</p></div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.55 }}>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">Career intelligence</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">Your current signal</h2></div><button type="button" className="hidden items-center gap-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-white sm:flex">View analysis <ArrowRight className="size-3.5" /></button></div>
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75 sm:grid-cols-2 lg:grid-cols-4 [&>*:not(:last-child)]:border-white/[0.07] [&>*:not(:last-child)]:max-sm:border-b sm:[&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardCard id="skills" title="Skill intelligence" description={`${data.skills.totalSkills} skills mapped to your target role`} action={<BrainCircuit className="size-5 text-[#8B5CF6]" />}>
          <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113]"><div className="landing-grid absolute inset-0 opacity-50" /><div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 shadow-[0_0_48px_rgba(139,92,246,0.18)]"><div className="text-center"><BrainCircuit className="mx-auto size-5 text-[#A78BFA]" /><p className="mt-2 text-[10px] font-medium text-white">Skill signal</p></div></div>{graphSkills.map((skill, index) => <div key={skill.name} className={`absolute ${nodePositions[index]} rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-2 text-xs text-[#C4B5FD]`}>{skill.name}</div>)}</div>
            <div><div className="space-y-5">{skillProgress.map((skill, index) => <div key={skill.name}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-[#D4D4D8]">{skill.name}</span><span className="tabular-nums text-[#71717A]">{skill.score}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${skillColors[index]}`} style={{ width: `${skill.score}%` }} /></div></div>)}</div>
              <div className="mt-8 space-y-5 border-t border-white/[0.07] pt-6"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">Strength areas</p><div className="flex flex-wrap gap-2">{data.skills.strongSkills.length ? data.skills.strongSkills.map((skill) => <SkillBadge key={skill.name} name={skill.name} level="strength" />) : <span className="text-xs text-[#71717A]">Complete skills to build strengths.</span>}</div></div><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">Improvement areas</p><div className="flex flex-wrap gap-2">{data.skills.improvementAreas.slice(0, 5).map((skill) => <SkillBadge key={skill.name} name={skill.name} level="focus" />)}</div></div></div>
            </div>
          </div>
        </DashboardCard>
        <AIInsightCard recommendations={data.aiInsight.recommendations} focusArea={data.aiInsight.focusArea} />
      </div>

      <DashboardCard id="roadmap" title="Roadmap preview" description={`${Math.round(data.roadmap.progress)}% complete`} action={<Route className="size-5 text-[#F59E0B]" />}><Timeline items={timeline} /></DashboardCard>
    </motion.div>
  )
}
