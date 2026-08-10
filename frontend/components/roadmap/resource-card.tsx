"use client"

import { BookOpen, Braces, Dumbbell, GraduationCap } from "lucide-react"
import { motion } from "framer-motion"

import type { LearningResource } from "@/features/roadmap/types/roadmap"

const icons = { Documentation: BookOpen, Projects: Braces, Courses: GraduationCap, Practice: Dumbbell }

export function ResourceCard({ resource, index }: { resource: LearningResource; index: number }) {
  const Icon = icons[resource.type]
  return <motion.article initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} whileHover={{ y: -2 }} className="group rounded-2xl border border-white/[0.08] bg-[#111113] p-5 transition-colors hover:border-[#8B5CF6]/25"><div className="flex items-center justify-between"><div className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#A78BFA] transition-colors group-hover:border-[#8B5CF6]/25"><Icon className="size-4" /></div><span className="text-xl font-semibold tracking-[-0.04em] text-white">{resource.count}</span></div><h3 className="mt-5 text-sm font-semibold text-white">{resource.type}</h3><p className="mt-2 text-xs leading-5 text-[#71717A]">{resource.description}</p></motion.article>
}
