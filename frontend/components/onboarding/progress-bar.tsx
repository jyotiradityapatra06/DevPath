"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div aria-label={`Onboarding step ${currentStep} of ${totalSteps}`}>
      <div className="mb-3 flex items-center justify-between text-xs font-medium">
        <span className="text-[#A1A1AA]">Your career profile</span>
        <span className="tabular-nums text-[#D4D4D8]">
          {String(currentStep).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="h-1 overflow-hidden rounded-full bg-white/[0.07]"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#10B981] transition-[width] duration-500 ease-out"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
