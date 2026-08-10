import { Check, Circle, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TimelineItem {
  stage: "Current" | "Next" | "Future"
  title: string
  description: string
  status: "active" | "next" | "future"
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="grid gap-0 lg:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.stage} className="relative flex gap-4 p-5 sm:p-6 lg:block">
          {index < items.length - 1 && (
            <div className="absolute left-[2.45rem] top-[4.3rem] h-[calc(100%-3.2rem)] w-px bg-white/[0.08] lg:left-[3.25rem] lg:top-[2.72rem] lg:h-px lg:w-[calc(100%-2rem)]" />
          )}
          <span
            className={cn(
              "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border",
              item.status === "active" && "border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399] shadow-[0_0_28px_rgba(16,185,129,0.14)]",
              item.status === "next" && "border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#A78BFA]",
              item.status === "future" && "border-white/10 bg-[#111113] text-[#52525B]",
            )}
          >
            {item.status === "active" ? <Check className="size-4" /> : item.status === "next" ? <Sparkles className="size-4" /> : <Circle className="size-3" />}
          </span>
          <div className="min-w-0 lg:mt-8">
            <p className={cn("text-xs font-semibold uppercase tracking-[0.15em]", item.status === "active" ? "text-[#34D399]" : item.status === "next" ? "text-[#A78BFA]" : "text-[#52525B]")}>{item.stage}</p>
            <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
            <p className="mt-2 text-xs leading-5 text-[#71717A]">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
