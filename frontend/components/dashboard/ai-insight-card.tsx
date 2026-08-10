import { ArrowRight, Bot, Sparkles } from "lucide-react"

export function AIInsightCard() {
  return (
    <section id="ai-coach" className="relative overflow-hidden rounded-3xl border border-[#8B5CF6]/20 bg-[#18181B] p-6 shadow-[0_28px_90px_-48px_rgba(139,92,246,0.6)] sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="grid size-11 place-items-center rounded-2xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#A78BFA]"><Bot className="size-5" /></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6EE7B7]"><span className="size-1.5 rounded-full bg-[#10B981]" />Ready</span>
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">DevPath intelligence</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Ask your AI career coach</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#A1A1AA]">Get guidance grounded in your goal, current skills, active roadmap, and the progress you have already made.</p>
        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#09090B]/70 p-2 pl-4">
          <Sparkles className="size-4 shrink-0 text-[#8B5CF6]" />
          <span className="min-w-0 flex-1 truncate text-sm text-[#71717A]">What should I focus on this week?</span>
          <button type="button" aria-label="Open AI career coach" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8B5CF6] text-white transition-all hover:bg-[#9D74F7] hover:shadow-lg hover:shadow-[#8B5CF6]/20"><ArrowRight className="size-4" /></button>
        </div>
      </div>
    </section>
  )
}
