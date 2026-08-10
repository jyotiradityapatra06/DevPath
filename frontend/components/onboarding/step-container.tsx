"use client"

import { motion } from "framer-motion"

interface StepContainerProps {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}

export function StepContainer({
  eyebrow,
  title,
  description,
  children,
}: StepContainerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">
        {eyebrow}
      </p>
      <h1 className="text-balance mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#A1A1AA] sm:text-base">
        {description}
      </p>
      {children && <div className="mt-8 sm:mt-10">{children}</div>}
    </motion.section>
  )
}
