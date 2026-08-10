"use client"

import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { BrainCircuit, Layers3, Sparkles, Target } from "lucide-react"
import { useEffect } from "react"

const metrics = [
  { label: "Current skill level", value: "Intermediate", icon: BrainCircuit, color: "text-[#A78BFA]" },
  { label: "Skills analyzed", value: 24, icon: Layers3, color: "text-[#D4D4D8]" },
  { label: "Strong areas", value: 8, icon: Sparkles, color: "text-[#6EE7B7]" },
  { label: "Improvement areas", value: 6, icon: Target, color: "text-[#FCD34D]" },
]

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [count, value])

  return <motion.span>{rounded}</motion.span>
}

export function SkillOverviewCard() {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#8B5CF6]">AI skill overview</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white">Your capability signal</h2></div>
        <BrainCircuit className="size-5 text-[#A78BFA]" />
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className="border-white/[0.07] p-5 not-last:border-b sm:p-6 sm:odd:border-r xl:not-last:border-b-0 xl:not-last:border-r">
            <Icon className={`size-4 ${color}`} />
            <p className="mt-7 text-xs uppercase tracking-[0.12em] text-[#71717A]">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{typeof value === "number" ? <AnimatedCounter value={value} /> : value}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
