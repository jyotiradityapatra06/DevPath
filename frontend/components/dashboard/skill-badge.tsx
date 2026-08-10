import { cn } from "@/lib/utils"

interface SkillBadgeProps {
  name: string
  level?: "strength" | "growing" | "focus"
}

const styles = {
  strength: "border-[#10B981]/25 bg-[#10B981]/10 text-[#6EE7B7]",
  growing: "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]",
  focus: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD34D]",
}

export function SkillBadge({ name, level = "growing" }: SkillBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium", styles[level])}>
      <span className={cn("size-1.5 rounded-full", level === "strength" ? "bg-[#10B981]" : level === "focus" ? "bg-[#F59E0B]" : "bg-[#8B5CF6]")} />
      {name}
    </span>
  )
}
