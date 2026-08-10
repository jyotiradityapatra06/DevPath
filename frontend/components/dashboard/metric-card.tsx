"use client"

import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useEffect } from "react"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
  accent?: "violet" | "emerald" | "amber" | "neutral"
}

const accents = {
  violet: "bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/20",
  emerald: "bg-[#10B981]/10 text-[#34D399] border-[#10B981]/20",
  amber: "bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/20",
  neutral: "bg-white/[0.04] text-[#A1A1AA] border-white/[0.08]",
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "neutral",
}: MetricCardProps) {
  const numericValue = value.match(/^(\d+)(%?)$/)
  return (
    <div className="group min-w-0 p-5 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/[0.025] sm:p-6">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-9 place-items-center rounded-xl border", accents[accent])}>
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="size-4 text-[#3F3F46] transition-colors group-hover:text-[#71717A]" />
      </div>
      <p className="mt-7 text-xs font-medium uppercase tracking-[0.13em] text-[#71717A]">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold tracking-[-0.035em] text-white">{numericValue ? <AnimatedMetric value={Number(numericValue[1])} suffix={numericValue[2]} /> : value}</p>
      <p className="mt-2 text-xs leading-5 text-[#71717A]">{detail}</p>
    </div>
  )
}

function AnimatedMetric({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`)
  useEffect(() => {
    const controls = animate(count, value, { duration: 0.75, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [count, value])
  return <motion.span className="tabular-nums">{rounded}</motion.span>
}
