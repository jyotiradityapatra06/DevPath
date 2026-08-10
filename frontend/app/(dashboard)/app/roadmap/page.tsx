"use client"

import { motion } from "framer-motion"
import { CalendarRange, Flag, Route, Target } from "lucide-react"

import { CurrentFocusCard } from "@/components/roadmap/current-focus-card"
import { MilestoneCard } from "@/components/roadmap/milestone-card"
import { ProgressIndicator } from "@/components/roadmap/progress-indicator"
import { ResourceCard } from "@/components/roadmap/resource-card"
import { RoadmapSkeleton } from "@/components/roadmap/roadmap-skeleton"
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline"
import { useGenerateRoadmap, useRoadmap } from "@/features/roadmap/hooks/use-roadmap"
import { getApiErrorMessage } from "@/lib/api/client"
import { MissingCareerProfileError, RoadmapUnavailableError } from "@/lib/api/roadmap"

export default function RoadmapPage() {
  const roadmapQuery = useRoadmap()
  const generateMutation = useGenerateRoadmap()

  if (roadmapQuery.isPending) return <RoadmapSkeleton />

  if (roadmapQuery.error || !roadmapQuery.data) {
    const missingProfile = roadmapQuery.error instanceof MissingCareerProfileError
    const unavailable = roadmapQuery.error instanceof RoadmapUnavailableError
    return (
      <RoadmapState
        title={missingProfile ? "Complete your profile to generate your roadmap." : unavailable ? "Generate your career roadmap" : "Your personalized roadmap is temporarily unavailable."}
        description={missingProfile ? "DevPath needs your target role and current skills before it can create a personalized journey." : unavailable ? "Your personalized roadmap is being prepared. Generate it now from your saved career goal and skill analysis." : getApiErrorMessage(roadmapQuery.error, "We couldn't load your roadmap. Please try again.")}
        actionLabel={unavailable ? "Generate roadmap" : "Try again"}
        isWorking={unavailable ? generateMutation.isPending : roadmapQuery.isFetching}
        error={generateMutation.error ? getApiErrorMessage(generateMutation.error, "We couldn't generate your roadmap. Please try again.") : null}
        onAction={() => unavailable ? generateMutation.mutate() : roadmapQuery.refetch()}
        hideAction={missingProfile}
      />
    )
  }

  const roadmap = roadmapQuery.data
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-[90rem] space-y-8 sm:space-y-10">
      <header className="border-b border-white/[0.07] pb-7"><div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]"><Route className="size-4" />Adaptive career planning</div><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Your AI Career Roadmap</h1><p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">A personalized path from your current skills to your target role.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><HeaderMetric icon={Target} label="Target role" value={roadmap.targetRole} /><HeaderMetric icon={CalendarRange} label="Estimated journey" value={roadmap.estimatedDuration} /><HeaderMetric icon={Flag} label="Current stage" value={roadmap.currentStage} className="col-span-2 sm:col-span-1" /></div></div><div className="mt-6 max-w-xl"><ProgressIndicator value={Math.round(roadmap.completionPercentage)} /></div></header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]"><div><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">Career journey</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">{roadmap.stages.length} stages to career ready</h2><p className="mt-2 text-sm text-[#71717A]">Open each stage to inspect the capabilities in your path.</p></div><RoadmapTimeline stages={roadmap.stages} /></div><div className="xl:sticky xl:top-24 xl:self-start"><CurrentFocusCard focus={roadmap.currentFocus} /></div></section>

      <section><SectionHeading eyebrow="Proof of skill" title="Project Milestones" description="Build evidence as you progress—not just course completion." /><div className="grid gap-4 lg:grid-cols-3">{roadmap.milestones.map((milestone, index) => <MilestoneCard key={`${milestone.title}-${index}`} milestone={milestone} index={index} />)}</div></section>

      <section><SectionHeading eyebrow="Curated for this stage" title="Learning Resources" description={`A focused resource mix for ${roadmap.targetRole}.`} />{roadmap.resources.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{roadmap.resources.map((resource, index) => <ResourceCard key={`${resource.title}-${index}`} resource={resource} index={index} />)}</div> : <div className="rounded-3xl border border-white/[0.08] bg-[#18181B]/75 p-7 text-sm text-[#71717A]">Curated resources for your current roadmap stage are being prepared.</div>}</section>
    </motion.div>
  )
}

function RoadmapState({ title, description, actionLabel, isWorking, error, onAction, hideAction }: { title: string; description: string; actionLabel: string; isWorking: boolean; error: string | null; onAction: () => void; hideAction: boolean }) {
  return <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center"><div className="w-full rounded-3xl border border-white/[0.08] bg-[#18181B] p-8 text-center sm:p-10"><Route className="mx-auto size-8 text-[#A78BFA]" /><h1 className="mt-5 text-2xl font-semibold text-white">{title}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#A1A1AA]">{description}</p>{error && <p role="alert" className="mt-5 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.07] px-4 py-3 text-sm text-[#FCD34D]">{error}</p>}{!hideAction && <button type="button" onClick={onAction} disabled={isWorking} className="mt-7 rounded-xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9D74F7] disabled:opacity-60">{isWorking ? "Creating your roadmap..." : actionLabel}</button>}</div></div>
}

function HeaderMetric({ icon: Icon, label, value, className = "" }: { icon: typeof Target; label: string; value: string; className?: string }) { return <div className={`rounded-2xl border border-white/[0.08] bg-[#18181B] px-4 py-3 ${className}`}><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#71717A]"><Icon className="size-3.5 text-[#A78BFA]" />{label}</div><p className="mt-2 whitespace-nowrap text-sm font-medium text-white">{value}</p></div> }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">{title}</h2><p className="mt-2 text-sm text-[#71717A]">{description}</p></div> }
