import { cn } from "@/lib/utils"
import type { SkillPriority } from "@/features/skills/types/skill-intelligence"

const styles = {
  HIGH: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD34D]",
  MEDIUM: "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]",
  LOW: "border-[#10B981]/25 bg-[#10B981]/10 text-[#6EE7B7]",
}

export function PriorityBadge({ priority }: { priority: SkillPriority }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em]", styles[priority])}>
      {priority}
    </span>
  )
}
