export type RoadmapStatus = "completed" | "current" | "upcoming"
export type MilestoneDifficulty = "Intermediate" | "Advanced"
export type MilestoneState = "completed" | "in-progress" | "planned"

export interface RoadmapStageData {
  id: number
  title: string
  description: string
  skills: string[]
  status: RoadmapStatus
  completion: number
  duration: string
}

export interface ProjectMilestone {
  title: string
  description: string
  skills: string[]
  difficulty: MilestoneDifficulty
  state: MilestoneState
}

export interface LearningResource {
  type: "Documentation" | "Projects" | "Courses" | "Practice"
  description: string
  count: number
}
