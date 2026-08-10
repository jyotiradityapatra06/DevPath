"use client"

import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit, Compass, Gauge, GraduationCap, Route, Sparkles, Target } from "lucide-react"

import { AIInsightCard } from "@/components/dashboard/ai-insight-card"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { SkillBadge } from "@/components/dashboard/skill-badge"
import { Timeline, type TimelineItem } from "@/components/dashboard/timeline"

const metrics = [
  { label: "Career goal", value: "Backend Engineer", detail: "Target role", icon: Target, accent: "violet" as const },
  { label: "AI readiness", value: "68%", detail: "+8% over the last month", icon: Gauge, accent: "emerald" as const },
  { label: "Current level", value: "Intermediate", detail: "Based on current skill signal", icon: GraduationCap, accent: "neutral" as const },
  { label: "Recommended next", value: "Deployment", detail: "Highest-impact capability", icon: Compass, accent: "amber" as const },
]

const timeline: TimelineItem[] = [
  { stage: "Current", title: "API architecture", description: "Strengthen service boundaries and production patterns.", status: "active" },
  { stage: "Next", title: "Cloud deployment", description: "Ship a containerized backend into a live environment.", status: "next" },
  { stage: "Future", title: "System design", description: "Build fluency in scale, reliability, and trade-offs.", status: "future" },
]

const skillProgress = [
  { name: "API Design", value: 84, color: "bg-[#10B981]" },
  { name: "Databases", value: 72, color: "bg-[#8B5CF6]" },
  { name: "System Design", value: 46, color: "bg-[#F59E0B]" },
]

export default function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mx-auto max-w-[90rem] space-y-6 sm:space-y-8">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-28 -top-32 size-96 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-[18%] size-56 rounded-full bg-[#10B981]/[0.07] blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#A1A1AA]"><span className="size-1.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />Career signal updated today</div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">Good evening, Jyotiraditya</h1>
            <p className="mt-4 text-base text-[#A1A1AA] sm:text-lg">Your AI career journey is evolving.</p>
          </div>
          <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.07] p-4"><Sparkles className="mt-0.5 size-4 shrink-0 text-[#A78BFA]" /><p className="text-xs leading-5 text-[#A1A1AA]"><span className="font-medium text-white">AI insight:</span> Your backend foundations are strong. Production deployment is the clearest next move.</p></div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.55 }}>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">Career intelligence</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">Your current signal</h2></div><button type="button" className="hidden items-center gap-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-white sm:flex">View analysis <ArrowRight className="size-3.5" /></button></div>
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75 sm:grid-cols-2 lg:grid-cols-4 [&>*:not(:last-child)]:border-white/[0.07] [&>*:not(:last-child)]:max-sm:border-b sm:[&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardCard id="skills" title="Skill intelligence" description="A preview of strengths and high-value growth areas" action={<BrainCircuit className="size-5 text-[#8B5CF6]" />}>
          <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113]">
              <div className="landing-grid absolute inset-0 opacity-50" />
              <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 shadow-[0_0_48px_rgba(139,92,246,0.18)]"><div className="text-center"><BrainCircuit className="mx-auto size-5 text-[#A78BFA]" /><p className="mt-2 text-[10px] font-medium text-white">Skill signal</p></div></div>
              <div className="absolute left-[8%] top-[15%] rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-2 text-xs text-[#6EE7B7]">Python</div>
              <div className="absolute right-[7%] top-[20%] rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-2 text-xs text-[#6EE7B7]">FastAPI</div>
              <div className="absolute bottom-[16%] left-[7%] rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-2 text-xs text-[#C4B5FD]">PostgreSQL</div>
              <div className="absolute bottom-[18%] right-[6%] rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-3 py-2 text-xs text-[#FCD34D]">Docker</div>
              <div className="absolute left-[22%] top-[34%] h-px w-[25%] rotate-[25deg] bg-gradient-to-r from-[#10B981]/20 to-[#8B5CF6]/60" /><div className="absolute right-[21%] top-[36%] h-px w-[25%] -rotate-[28deg] bg-gradient-to-l from-[#10B981]/20 to-[#8B5CF6]/60" /><div className="absolute bottom-[33%] left-[21%] h-px w-[26%] -rotate-[26deg] bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/60" /><div className="absolute bottom-[34%] right-[20%] h-px w-[27%] rotate-[27deg] bg-gradient-to-l from-[#F59E0B]/20 to-[#8B5CF6]/60" />
            </div>
            <div>
              <div className="space-y-5">{skillProgress.map((skill) => <div key={skill.name}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-[#D4D4D8]">{skill.name}</span><span className="tabular-nums text-[#71717A]">{skill.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.value}%` }} /></div></div>)}</div>
              <div className="mt-8 space-y-5 border-t border-white/[0.07] pt-6"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">Strength areas</p><div className="flex flex-wrap gap-2"><SkillBadge name="Python" level="strength" /><SkillBadge name="REST APIs" level="strength" /></div></div><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">Improvement areas</p><div className="flex flex-wrap gap-2"><SkillBadge name="System Design" level="focus" /><SkillBadge name="Cloud" level="focus" /></div></div></div>
            </div>
          </div>
        </DashboardCard>

        <AIInsightCard />
      </div>

      <DashboardCard id="roadmap" title="Roadmap preview" description="The next stages in your active growth path" action={<Route className="size-5 text-[#F59E0B]" />}>
        <Timeline items={timeline} />
      </DashboardCard>
    </motion.div>
  )
}
