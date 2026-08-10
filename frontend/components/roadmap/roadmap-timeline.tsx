"use client"

import { RoadmapStage } from "@/components/roadmap/roadmap-stage"
import type { RoadmapStageData } from "@/features/roadmap/types/roadmap"

export function RoadmapTimeline({ stages }: { stages: RoadmapStageData[] }) {
  return <div className="relative space-y-4 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-gradient-to-b before:from-[#10B981] before:via-[#8B5CF6]/55 before:to-white/[0.06] sm:before:left-7">{stages.map((stage, index) => <RoadmapStage key={stage.id} stage={stage} index={index} />)}</div>
}
