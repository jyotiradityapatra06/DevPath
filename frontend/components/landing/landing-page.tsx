"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Database,
  GitBranch,
  Menu,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { BrandMark } from "@/components/shared/brand-mark"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "Roadmaps", href: "#roadmaps" },
  { label: "AI Coach", href: "#coach" },
]

const trustSignals = [
  { icon: BrainCircuit, label: "AI powered" },
  { icon: Target, label: "Skill intelligence" },
  { icon: Route, label: "Personalized roadmap" },
  { icon: BarChart3, label: "Career analytics" },
]

const stories = [
  {
    eyebrow: "01 · Career Intelligence",
    title: "A clear picture of where you are.",
    copy: "DevPath reads your profile, goals, current skills, and progress as one connected career signal—not a collection of disconnected inputs.",
    points: ["Profile-aware analysis", "Role readiness signals", "Strengths with context"],
    accent: "violet",
    visual: "intelligence",
    id: "intelligence",
  },
  {
    eyebrow: "02 · Skill Gap Analysis",
    title: "Know exactly what to learn next.",
    copy: "See the distance between your current capabilities and the role you want. Gaps are ranked by impact, so effort goes where it matters.",
    points: ["Role-specific gaps", "Priority scoring", "Actionable learning focus"],
    accent: "emerald",
    visual: "skills",
    id: "skills",
  },
  {
    eyebrow: "03 · Adaptive Roadmaps",
    title: "A path that changes as you do.",
    copy: "Turn your highest-value gaps into a focused sequence of learning steps. As progress changes, DevPath helps you reassess the route ahead.",
    points: ["Ordered learning steps", "Progress-aware direction", "Realistic weekly effort"],
    accent: "amber",
    visual: "roadmap",
    id: "roadmaps",
  },
  {
    eyebrow: "04 · AI Career Coach",
    title: "Personal guidance, whenever you need it.",
    copy: "Ask questions against your real career context. Get advice that understands your target role, active roadmap, and the work you have already done.",
    points: ["Context-aware conversation", "Practical next actions", "Persistent coaching history"],
    accent: "violet",
    visual: "coach",
    id: "coach",
  },
]

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function LandingNavbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#09090B]/75 px-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:px-5">
        <BrandMark inverse href="/" />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Landing navigation">
          {navLinks.map((link) => <a key={link.label} href={link.href} className="text-sm text-[#A1A1AA] transition-colors hover:text-white">{link.label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-[#D4D4D8] transition-colors hover:bg-white/5 hover:text-white">Log in</Link>
          <Link href="/register" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FAFAFA] px-4 text-sm font-semibold text-[#09090B] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-violet-500/15">Get started <ArrowRight className="size-4" /></Link>
        </div>
        <button className="grid size-10 place-items-center rounded-xl border border-white/10 text-white sm:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {open && <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[#111113]/95 p-3 shadow-2xl backdrop-blur-xl sm:hidden"><nav className="grid">{navLinks.map((link) => <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-[#D4D4D8] hover:bg-white/5">{link.label}</a>)}</nav><div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3"><Link href="/login" className="grid h-11 place-items-center rounded-xl border border-white/10 text-sm text-white">Log in</Link><Link href="/register" className="grid h-11 place-items-center rounded-xl bg-white text-sm font-semibold text-black">Get started</Link></div></div>}
    </header>
  )
}

function IntelligenceVisual() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
      <div className="absolute -inset-14 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111113]/90 p-3 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-2 pb-4">
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#10B981] shadow-[0_0_14px_#10B981]" /><span className="text-xs font-medium text-[#A1A1AA]">Career intelligence · Live context</span></div>
          <div className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-white/20" /><span className="size-1.5 rounded-full bg-white/20" /><span className="size-1.5 rounded-full bg-white/20" /></div>
        </div>
        <div className="grid gap-4 pt-4 md:grid-cols-[1fr_18rem]">
          <div className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#09090B] sm:min-h-[32rem]">
            <div className="landing-grid absolute inset-0 opacity-65" />
            <div className="intelligence-node absolute left-[10%] top-[18%] rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA]"><Code2 className="mb-2 size-4 text-[#10B981]" />API Design</div>
            <div className="intelligence-node absolute right-[9%] top-[13%] rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA]"><Database className="mb-2 size-4 text-[#10B981]" />Databases</div>
            <div className="intelligence-node absolute bottom-[16%] left-[8%] rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA]"><GitBranch className="mb-2 size-4 text-[#F59E0B]" />Systems</div>
            <div className="intelligence-node absolute bottom-[19%] right-[7%] rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA]"><ShieldCheck className="mb-2 size-4 text-[#F59E0B]" />Deployment</div>
            <div className="absolute left-[16%] top-[30%] h-px w-[30%] origin-left rotate-[22deg] bg-gradient-to-r from-[#10B981]/20 to-[#8B5CF6]/70" />
            <div className="absolute right-[17%] top-[29%] h-px w-[28%] origin-right -rotate-[26deg] bg-gradient-to-l from-[#10B981]/20 to-[#8B5CF6]/70" />
            <div className="absolute bottom-[29%] left-[17%] h-px w-[30%] origin-left -rotate-[25deg] bg-gradient-to-r from-[#F59E0B]/20 to-[#8B5CF6]/70" />
            <div className="absolute bottom-[31%] right-[16%] h-px w-[29%] origin-right rotate-[25deg] bg-gradient-to-l from-[#F59E0B]/20 to-[#8B5CF6]/70" />
            <div className="absolute left-1/2 top-1/2 grid size-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#8B5CF6]/45 bg-[#8B5CF6]/10 shadow-[0_0_70px_rgba(139,92,246,0.28)] sm:size-48">
              <div className="grid size-28 place-items-center rounded-full border border-[#8B5CF6]/70 bg-[#18181B] text-center sm:size-32"><Compass className="mx-auto size-6 text-[#8B5CF6]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#71717A]">Direction</p><p className="mt-1 text-sm font-semibold text-white">Backend Engineer</p></div></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#18181B]/85 px-4 py-3 backdrop-blur"><Sparkles className="size-4 shrink-0 text-[#8B5CF6]" /><p className="text-xs leading-5 text-[#A1A1AA]"><span className="font-medium text-white">AI insight:</span> Deployment is the highest-impact next capability.</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-white/[0.07] bg-[#18181B] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#71717A]">Role readiness</p><div className="mt-5 flex items-end justify-between"><span className="text-4xl font-semibold tracking-[-0.05em] text-white">68<span className="text-lg text-[#71717A]">%</span></span><span className="rounded-full bg-[#10B981]/10 px-2 py-1 text-[10px] font-medium text-[#34D399]">+8 this month</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981]" /></div></div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#18181B] p-5"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.16em] text-[#71717A]">Priority signal</p><Target className="size-4 text-[#F59E0B]" /></div><p className="mt-5 text-lg font-medium text-white">Production systems</p><p className="mt-2 text-xs leading-5 text-[#A1A1AA]">The clearest path from current skills to target-role readiness.</p><div className="mt-5 flex gap-1">{[1,2,3,4,5].map((item) => <span key={item} className={cn("h-1 flex-1 rounded-full", item < 5 ? "bg-[#F59E0B]" : "bg-white/10")} />)}</div></div>
            <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.07] p-5 sm:col-span-2 md:col-span-1"><Bot className="size-5 text-[#A78BFA]" /><p className="mt-4 text-sm font-medium text-white">Your path is connected.</p><p className="mt-2 text-xs leading-5 text-[#A1A1AA]">Every insight reflects your goals, gaps, roadmap, and progress.</p></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StoryVisual({ type }: { type: string }) {
  if (type === "skills") return <div className="grid grid-cols-2 gap-3">{[["API Design","Strong","emerald"],["Databases","Growing","violet"],["System Design","Next","amber"],["Deployment","Priority","amber"]].map(([skill,status,color]) => <div key={skill} className="rounded-2xl border border-white/[0.08] bg-[#111113] p-4"><div className={cn("mb-8 size-2 rounded-full", color === "emerald" ? "bg-[#10B981]" : color === "amber" ? "bg-[#F59E0B]" : "bg-[#8B5CF6]")} /><p className="text-sm font-medium text-white">{skill}</p><p className="mt-1 text-xs text-[#71717A]">{status}</p></div>)}</div>
  if (type === "roadmap") return <div className="space-y-3">{["Strengthen API architecture","Build deployment fluency","Practice system design"].map((step,index) => <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#111113] p-4"><span className={cn("grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold", index === 0 ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399]" : index === 1 ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FBBF24]" : "border-white/10 text-[#71717A]")}>{index === 0 ? <Check className="size-4" /> : `0${index+1}`}</span><div className="flex-1"><p className="text-sm font-medium text-white">{step}</p><div className="mt-2 h-1 rounded-full bg-white/[0.06]"><div className={cn("h-full rounded-full", index === 0 ? "w-full bg-[#10B981]" : index === 1 ? "w-2/5 bg-[#F59E0B]" : "w-0")} /></div></div></div>)}</div>
  if (type === "coach") return <div className="space-y-3"><div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#8B5CF6] p-4 text-sm leading-6 text-white">What should I focus on before applying for backend roles?</div><div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-[#111113] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#A78BFA]"><Sparkles className="size-3.5" />DevPath Coach</div><p className="text-sm leading-6 text-[#D4D4D8]">Your API foundation is strong. The highest-leverage next step is demonstrating deployment and system design through one production-ready project.</p></div></div>
  return <div className="relative h-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]"><div className="landing-grid absolute inset-0" /><div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#8B5CF6]/50 bg-[#8B5CF6]/10 shadow-[0_0_60px_rgba(139,92,246,.2)]"><BrainCircuit className="size-8 text-[#8B5CF6]" /></div>{[["Profile","left-5 top-7"],["Skills","right-5 top-10"],["Progress","bottom-7 left-8"],["Goal","bottom-8 right-7"]].map(([label,pos]) => <span key={label} className={cn("absolute rounded-full border border-white/10 bg-[#18181B] px-3 py-1.5 text-xs text-[#A1A1AA]",pos)}>{label}</span>)}</div>
}

export function LandingPage() {
  return (
    <div className="dark min-h-screen overflow-hidden bg-[#09090B] text-[#FAFAFA] selection:bg-[#8B5CF6]/40">
      <LandingNavbar />
      <main>
        <section className="relative px-4 pb-24 pt-40 sm:px-6 sm:pt-48 lg:pb-36">
          <div className="aurora-mesh absolute inset-0" /><div className="landing-grid absolute inset-0" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#A1A1AA] backdrop-blur"><span className="size-1.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />AI career intelligence, grounded in your progress</motion.div>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7 }} className="text-balance mt-8 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-7xl lg:text-[5.5rem]">Navigate your career <span className="bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#34D399] bg-clip-text text-transparent">with intelligence.</span></motion.h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.7 }} className="text-balance mx-auto mt-7 max-w-2xl text-base leading-7 text-[#A1A1AA] sm:text-lg sm:leading-8">DevPath uses AI-powered career analysis to understand your skills, identify gaps, and build a personalized growth path.</motion.p>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.7 }} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/register" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#09090B] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#8B5CF6]/20 sm:w-auto">Build your career path <ArrowRight className="size-4" /></Link><a href="#product" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white transition-colors hover:bg-white/[0.07] sm:w-auto">Explore the intelligence <ChevronRight className="size-4" /></a></motion.div>
            </div>
            <IntelligenceVisual />
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[#111113]/65 px-4 py-8 sm:px-6"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">{trustSignals.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-[#71717A] sm:text-sm"><Icon className="size-4 text-[#A1A1AA]" />{label}</div>)}</div></section>

        <section id="product" className="px-4 py-28 sm:px-6 sm:py-36">
          <Reveal className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B5CF6]">One connected intelligence layer</p><h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">Career growth is not a checklist. It is a system.</h2><p className="mt-6 max-w-2xl text-base leading-8 text-[#A1A1AA]">DevPath connects who you are, where you want to go, what you know, and what you have completed—then turns that context into direction.</p></div></Reveal>
            <div className="mx-auto mt-24 max-w-7xl space-y-28 sm:space-y-36">{stories.map((story,index) => <Reveal key={story.title}><article id={story.id} className="grid scroll-mt-28 items-center gap-12 lg:grid-cols-2 lg:gap-20"><div className={cn(index % 2 === 1 && "lg:order-2")}><p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", story.accent === "emerald" ? "text-[#10B981]" : story.accent === "amber" ? "text-[#F59E0B]" : "text-[#8B5CF6]")}>{story.eyebrow}</p><h3 className="text-balance mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">{story.title}</h3><p className="mt-6 text-base leading-8 text-[#A1A1AA]">{story.copy}</p><ul className="mt-8 space-y-3">{story.points.map((point) => <li key={point} className="flex items-center gap-3 text-sm text-[#D4D4D8]"><span className={cn("grid size-6 place-items-center rounded-full", story.accent === "emerald" ? "bg-[#10B981]/10 text-[#34D399]" : story.accent === "amber" ? "bg-[#F59E0B]/10 text-[#FBBF24]" : "bg-[#8B5CF6]/10 text-[#A78BFA]")}><Check className="size-3.5" /></span>{point}</li>)}</ul></div><div className={cn("premium-surface rounded-[1.75rem] border border-white/[0.08] bg-[#18181B]/70 p-4 shadow-2xl shadow-black/30 sm:p-6", index % 2 === 1 && "lg:order-1")}><StoryVisual type={story.visual} /></div></article></Reveal>)}</div>
        </section>

        <section className="relative border-t border-white/[0.07] px-4 py-28 sm:px-6 sm:py-40"><div className="aurora-mesh absolute inset-0 opacity-70" /><Reveal className="relative mx-auto max-w-5xl text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10"><Compass className="size-6 text-[#A78BFA]" /></div><h2 className="text-balance mt-8 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">Your career deserves a navigation system.</h2><p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#A1A1AA]">Stop guessing at the next step. Build a path that understands where you are and adapts to where you are going.</p><Link href="/register" className="mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-[#8B5CF6] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#9D74F7] hover:shadow-xl hover:shadow-[#8B5CF6]/20">Get started with DevPath <ArrowRight className="size-4" /></Link></Reveal></section>
      </main>
      <footer className="border-t border-white/[0.07] px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row"><BrandMark inverse href="/" /><p className="text-xs text-[#71717A]">Career intelligence for a clearer path forward.</p><div className="flex gap-5 text-xs text-[#71717A]"><Link href="/login" className="hover:text-white">Log in</Link><Link href="/register" className="hover:text-white">Get started</Link></div></div></footer>
    </div>
  )
}
