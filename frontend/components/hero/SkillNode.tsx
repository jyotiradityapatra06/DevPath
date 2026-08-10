import { cn } from "@/lib/utils"

type SkillNodeProps = { id: string; label: string; position: string; accent?: "purple" | "cyan" | "amber" | "emerald" }

export function SkillNode({ id, label, position, accent = "purple" }: SkillNodeProps) {
  return (
    <div data-network-node data-node-id={id} className={cn("absolute z-20 -translate-x-1/2 -translate-y-1/2", position)}>
      <div data-node-surface className={cn("rounded-full border bg-[#0D0D10]/80 px-3 py-2 shadow-xl backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 sm:px-4 sm:py-2.5", accent === "cyan" && "border-[#22D3EE]/25 shadow-[#22D3EE]/10", accent === "emerald" && "border-[#10B981]/25 shadow-[#10B981]/10", accent === "amber" && "border-[#F59E0B]/25 shadow-[#F59E0B]/10", accent === "purple" && "border-[#A78BFA]/25 shadow-[#8B5CF6]/10")}>
        <div className="flex items-center gap-2"><span data-node-signal className={cn("size-1.5 rounded-full shadow-[0_0_12px_currentColor]", accent === "cyan" && "bg-[#22D3EE] text-[#22D3EE]", accent === "emerald" && "bg-[#10B981] text-[#10B981]", accent === "amber" && "bg-[#F59E0B] text-[#F59E0B]", accent === "purple" && "bg-[#A78BFA] text-[#A78BFA]")} /><span className="whitespace-nowrap text-[10px] font-medium text-[#E4E4E7] sm:text-xs">{label}</span></div>
      </div>
    </div>
  )
}
