import { BrainCircuit, CircleCheck, Target, TrendingUp } from "lucide-react"

export function CoachHeader() {
  return (
    <header className="border-b border-white/[0.07] pb-7">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]"><BrainCircuit className="size-4" />Personal intelligence</div><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">AI Career Coach</h1><p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">Your personalized career intelligence companion.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="col-span-2 flex items-center gap-2 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.07] px-4 py-3 sm:col-span-1"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#10B981] opacity-40" /><span className="relative inline-flex size-2 rounded-full bg-[#10B981]" /></span><div><p className="text-[9px] uppercase tracking-[0.14em] text-[#6EE7B7]">AI status</p><p className="mt-1 whitespace-nowrap text-xs font-medium text-white">Career Intelligence Active</p></div></div><ContextMetric icon={Target} label="Target role" value="AI Engineer" /><ContextMetric icon={TrendingUp} label="Current level" value="Intermediate" /></div>
      </div>
    </header>
  )
}

function ContextMetric({ icon: Icon, label, value }: { icon: typeof CircleCheck; label: string; value: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-[#18181B] px-4 py-3"><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#71717A]"><Icon className="size-3.5 text-[#A78BFA]" />{label}</div><p className="mt-2 whitespace-nowrap text-sm font-medium text-white">{value}</p></div> }
