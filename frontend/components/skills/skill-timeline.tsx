import { ArrowDown, Check, Flag, Sparkles } from "lucide-react"

const stages = [
  { label: "Current Skills", detail: "Python · SQL · Core ML", icon: Check, tone: "emerald" },
  { label: "Next Skills", detail: "Deep Learning · FastAPI · Cloud", icon: Sparkles, tone: "violet" },
  { label: "Career Ready", detail: "Production AI Engineer profile", icon: Flag, tone: "amber" },
]

export function SkillTimeline() {
  return (
    <div className="grid items-center gap-3 p-5 sm:p-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {stages.map(({ label, detail, icon: Icon, tone }, index) => (
        <div key={label} className="contents">
          <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
            <span className={`grid size-9 place-items-center rounded-xl border ${tone === "emerald" ? "border-[#10B981]/20 bg-[#10B981]/10 text-[#34D399]" : tone === "violet" ? "border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-[#A78BFA]" : "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#FBBF24]"}`}><Icon className="size-4" /></span>
            <p className="mt-5 text-sm font-semibold text-white">{label}</p><p className="mt-2 text-xs leading-5 text-[#71717A]">{detail}</p>
          </div>
          {index < stages.length - 1 && <div className="grid place-items-center text-[#52525B]"><ArrowDown className="size-4 lg:-rotate-90" /></div>}
        </div>
      ))}
    </div>
  )
}
