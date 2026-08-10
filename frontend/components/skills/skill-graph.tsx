"use client"

import { motion } from "framer-motion"
import { useState } from "react"

import type { SkillConnection, SkillNode, SkillState } from "@/features/skills/types/skill-intelligence"
import { cn } from "@/lib/utils"

const nodeStyles: Record<SkillState, string> = {
  strong: "border-[#10B981]/50 bg-[#10B981]/12 text-[#A7F3D0] shadow-[0_0_28px_rgba(16,185,129,0.13)]",
  learning: "border-[#8B5CF6]/50 bg-[#8B5CF6]/12 text-[#DDD6FE] shadow-[0_0_28px_rgba(139,92,246,0.13)]",
  missing: "border-[#F59E0B]/55 bg-[#18181B] text-[#FCD34D]",
}

const stateLabels: Record<SkillState, string> = {
  strong: "Strong",
  learning: "Learning",
  missing: "Missing",
}

interface SkillGraphProps {
  nodes: SkillNode[]
  connections: SkillConnection[]
  targetRole: string
}

export function SkillGraph({ nodes, connections, targetRole }: SkillGraphProps) {
  const [activeId, setActiveId] = useState(nodes[0]?.id ?? "")
  const activeNode = nodes.find((node) => node.id === activeId) ?? nodes[0]
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))

  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75">
      <header className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><h2 className="text-lg font-semibold tracking-[-0.025em] text-white">Your skill map</h2><p className="mt-1 text-sm text-[#71717A]">Explore how capabilities connect to your target role.</p></div>
        <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.12em] text-[#71717A]">{(["strong", "learning", "missing"] as SkillState[]).map((state) => <span key={state} className="flex items-center gap-1.5"><span className={cn("size-1.5 rounded-full", state === "strong" ? "bg-[#10B981]" : state === "learning" ? "bg-[#8B5CF6]" : "bg-[#F59E0B]")} />{stateLabels[state]}</span>)}</div>
      </header>
      <div className="grid lg:grid-cols-[1fr_15rem]">
        <div className="relative min-h-[28rem] overflow-hidden bg-[#111113] sm:min-h-[34rem]">
          <div className="landing-grid pointer-events-none absolute inset-0 opacity-50" />
          <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {connections.map((connection, index) => {
              const from = nodeMap.get(connection.from)
              const to = nodeMap.get(connection.to)
              if (!from || !to) return null
              const highlighted = activeId === from.id || activeId === to.id
              return <motion.line key={`${connection.from}-${connection.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={highlighted ? "rgba(139,92,246,.65)" : "rgba(255,255,255,.09)"} strokeWidth={highlighted ? 0.45 : 0.3} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.08 * index, duration: 0.6 }} />
            })}
          </svg>
          {nodes.map((node, index) => (
            <motion.button
              key={node.id}
              type="button"
              aria-pressed={activeId === node.id}
              aria-label={`${node.name}, ${stateLabels[node.state]}`}
              onMouseEnter={() => setActiveId(node.id)}
              onFocus={() => setActiveId(node.id)}
              onClick={() => setActiveId(node.id)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 * index, duration: 0.35 }}
              whileHover={{ y: -3, scale: 1.03 }}
              className={cn("absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-left transition-[border-color,background-color] focus-visible:ring-2 focus-visible:ring-[#8B5CF6] sm:px-4 sm:py-3", nodeStyles[node.state], activeId === node.id && "ring-1 ring-white/25")}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span className="block whitespace-nowrap text-[11px] font-semibold sm:text-xs">{node.name}</span>
              <span className="mt-1 hidden text-[9px] opacity-60 sm:block">{node.level}% signal</span>
            </motion.button>
          ))}
        </div>
        <aside className="border-t border-white/[0.07] p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#71717A]">Selected signal</p>
          <div className={cn("mt-5 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]", nodeStyles[activeNode.state])}>{stateLabels[activeNode.state]}</div>
          <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{activeNode.name}</h3>
          <p className="mt-2 text-sm text-[#71717A]">{activeNode.note}</p>
          <div className="mt-8"><div className="flex items-end justify-between"><span className="text-xs text-[#71717A]">Capability signal</span><span className="text-3xl font-semibold tracking-[-0.05em] text-white">{activeNode.level}<span className="text-sm text-[#52525B]">%</span></span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div key={activeNode.id} initial={{ scaleX: 0 }} animate={{ scaleX: activeNode.level / 100 }} transition={{ duration: 0.55 }} className={cn("h-full w-full origin-left rounded-full", activeNode.state === "strong" ? "bg-[#10B981]" : activeNode.state === "learning" ? "bg-[#8B5CF6]" : "bg-[#F59E0B]")} /></div></div>
          <p className="mt-8 border-t border-white/[0.07] pt-6 text-xs leading-5 text-[#71717A]">Select any node to inspect its role in your {targetRole} readiness profile.</p>
        </aside>
      </div>
    </section>
  )
}
