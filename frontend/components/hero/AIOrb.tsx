import { Sparkles } from "lucide-react"

export function AIOrb() {
  return (
    <div data-ai-orb className="absolute left-1/2 top-1/2 z-10 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full sm:size-36">
      <span data-orb-ambient className="absolute inset-[-75%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),rgba(34,211,238,0.06)_38%,transparent_70%)] blur-2xl" />
      <span data-orb-glow className="absolute inset-[-40%] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
      <span data-orb-ring className="absolute inset-[-14%] rounded-full border border-[#A78BFA]/25 shadow-[0_0_38px_rgba(139,92,246,0.22),inset_0_0_24px_rgba(34,211,238,0.08)]" />
      <span data-orb-ring className="absolute inset-[-5%] rounded-full border border-dashed border-[#22D3EE]/15" />
      <span data-orb-core className="absolute inset-0 rounded-full border border-[#A78BFA]/40 bg-[#8B5CF6]/10 shadow-[inset_0_0_36px_rgba(139,92,246,0.26),0_0_55px_rgba(139,92,246,0.28)] backdrop-blur-md" />
      <span data-orb-core className="absolute inset-[14%] rounded-full border border-[#22D3EE]/20 bg-gradient-to-br from-[#A78BFA]/30 via-[#18181B] to-[#22D3EE]/15" />
      <span data-orb-symbol className="relative grid place-items-center"><Sparkles className="size-9 text-[#C4B5FD] drop-shadow-[0_0_12px_rgba(167,139,250,0.9)] sm:size-11" strokeWidth={1.75} /></span>
      <span className="absolute -bottom-8 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#A1A1AA] sm:-bottom-9 sm:text-[10px]">AI career core</span>
    </div>
  )
}
