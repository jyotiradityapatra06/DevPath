"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface OptionCardProps {
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  selected: boolean
  onSelect: () => void
}

export function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      animate={{ scale: selected ? 1.01 : 1 }}
      className={cn(
        "group relative flex min-h-24 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#8B5CF6] sm:p-5",
        selected
          ? "border-[#8B5CF6]/70 bg-[#8B5CF6]/10 shadow-[0_16px_40px_-24px_rgba(139,92,246,0.8)]"
          : "border-white/[0.08] bg-[#18181B]/75 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#18181B]",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors",
            selected
              ? "border-[#8B5CF6]/35 bg-[#8B5CF6]/15 text-[#A78BFA]"
              : "border-white/[0.08] bg-white/[0.03] text-[#71717A] group-hover:text-[#A1A1AA]",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white sm:text-base">{label}</span>
        {description && (
          <span className="mt-1 block text-xs leading-5 text-[#71717A]">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border transition-all",
          selected
            ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
            : "border-white/15 text-transparent",
        )}
      >
        <Check className="size-3.5" />
      </span>
    </motion.button>
  )
}
