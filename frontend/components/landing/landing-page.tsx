"use client"

import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Compass,
  Menu,
  Route,
  Sparkles,
  Target,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { BrandMark } from "@/components/shared/brand-mark"
import { CareerNetwork } from "@/components/hero/CareerNetwork"
import { cn } from "@/lib/utils"
import { initializeLandingAnimations } from "@/src/animations"

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
  return <div className={className} data-scroll-reveal>{children}</div>
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
    <div data-hero-visual className="hero-visual relative min-w-0 lg:pl-4">
      <div className="absolute inset-[12%] rounded-full bg-[#8B5CF6]/12 blur-3xl" />
      <CareerNetwork />
    </div>
  )
}

function StoryVisual({ type }: { type: string }) {
  if (type === "skills") return <div className="grid grid-cols-2 gap-3">{[["API Design","Strong","emerald"],["Databases","Growing","violet"],["System Design","Next","amber"],["Deployment","Priority","amber"]].map(([skill,status,color]) => <div key={skill} className="rounded-2xl border border-white/[0.08] bg-[#111113] p-4"><div className={cn("mb-8 size-2 rounded-full", color === "emerald" ? "bg-[#10B981]" : color === "amber" ? "bg-[#F59E0B]" : "bg-[#8B5CF6]")} /><p className="text-sm font-medium text-white">{skill}</p><p className="mt-1 text-xs text-[#71717A]">{status}</p></div>)}</div>
  if (type === "roadmap") return <div className="space-y-3">{["Strengthen API architecture","Build deployment fluency","Practice system design"].map((step,index) => <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#111113] p-4"><span className={cn("grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold", index === 0 ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399]" : index === 1 ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FBBF24]" : "border-white/10 text-[#71717A]")}>{index === 0 ? <Check className="size-4" /> : `0${index+1}`}</span><div className="flex-1"><p className="text-sm font-medium text-white">{step}</p><div className="mt-2 h-1 rounded-full bg-white/[0.06]"><div className={cn("h-full rounded-full", index === 0 ? "w-full bg-[#10B981]" : index === 1 ? "w-2/5 bg-[#F59E0B]" : "w-0")} /></div></div></div>)}</div>
  if (type === "coach") return <div className="space-y-3"><div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#8B5CF6] p-4 text-sm leading-6 text-white">What should I focus on before applying for backend roles?</div><div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-[#111113] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#A78BFA]"><Sparkles className="size-3.5" />DevPath Coach</div><p className="text-sm leading-6 text-[#D4D4D8]">Your API foundation is strong. The highest-leverage next step is demonstrating deployment and system design through one production-ready project.</p></div></div>
  return <div className="relative h-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]"><div className="landing-grid absolute inset-0" /><div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#8B5CF6]/50 bg-[#8B5CF6]/10 shadow-[0_0_60px_rgba(139,92,246,.2)]"><BrainCircuit className="size-8 text-[#8B5CF6]" /></div>{[["Profile","left-5 top-7"],["Skills","right-5 top-10"],["Progress","bottom-7 left-8"],["Goal","bottom-8 right-7"]].map(([label,pos]) => <span key={label} className={cn("absolute rounded-full border border-white/10 bg-[#18181B] px-3 py-1.5 text-xs text-[#A1A1AA]",pos)}>{label}</span>)}</div>
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    return initializeLandingAnimations(pageRef.current)
  }, [])

  return (
    <div ref={pageRef} className="landing-motion-root dark min-h-screen overflow-hidden bg-[#09090B] text-[#FAFAFA] selection:bg-[#8B5CF6]/40">
      <LandingNavbar />
      <main>
        <section className="relative px-4 pb-24 pt-40 sm:px-6 sm:pt-48 lg:pb-36">
          <div className="aurora-mesh absolute inset-0" /><div className="landing-grid absolute inset-0" />
          <div data-network-root className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(30rem,1.08fr)] lg:gap-6">
              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
                <div data-hero-badge className="hero-badge inline-flex flex-col items-center gap-5 lg:items-start"><BrandMark inverse href="/" /><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#A1A1AA] backdrop-blur"><span className="size-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE]" />AI career intelligence, grounded in your progress</span></div>
                <h1 data-hero-title className="hero-title text-balance mt-8 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-7xl lg:text-[4.75rem] xl:text-[5.25rem]"><span data-hero-line className="block">Navigate your career</span><span data-hero-line className="block">with <span className="hero-intelligence">intelligence.</span></span></h1>
                <p data-hero-description className="hero-description text-balance mx-auto mt-7 max-w-2xl text-base leading-7 text-[#A1A1AA] sm:text-lg sm:leading-8 lg:mx-0">DevPath uses AI-powered career analysis to understand your skills, identify gaps, and build a personalized growth path.</p>
                <div data-hero-buttons className="hero-buttons mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"><Link data-hero-cta href="/register" className="hero-cta inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-5 text-sm font-semibold text-[#09090B] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#8B5CF6]/25 sm:w-auto">Build your career path <ArrowRight className="size-4" /></Link><a data-hero-cta href="#product" className="hero-cta inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:border-[#A78BFA]/35 hover:bg-white/[0.07] hover:shadow-[0_0_28px_rgba(139,92,246,0.12)] sm:w-auto">Explore the intelligence <ChevronRight className="size-4" /></a></div>
              </div>
              <IntelligenceVisual />
            </div>
          </div>
        </section>

        <section data-scroll-reveal className="border-y border-white/[0.07] bg-[#111113]/65 px-4 py-8 sm:px-6"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">{trustSignals.map(({ icon: Icon, label }) => <div data-reveal-item key={label} className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-[#71717A] sm:text-sm"><Icon className="size-4 text-[#A1A1AA]" />{label}</div>)}</div></section>

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
