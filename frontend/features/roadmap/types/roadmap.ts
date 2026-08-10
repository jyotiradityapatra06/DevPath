export type RoadmapStatus = "completed" | "current" | "upcoming"
export type MilestoneDifficulty = "Beginner" | "Intermediate" | "Advanced"
export type MilestoneState = "completed" | "in-progress" | "planned"
export type RoadmapPriority = "HIGH" | "MEDIUM" | "LOW"

export interface RoadmapStage {
  id: number
  title: string
  description: string
  status: RoadmapStatus
  progress: number
  duration: string
  skills: string[]
  completion: number
}

export interface RoadmapMilestone {
  title: string
  description: string
  difficulty: MilestoneDifficulty
  status: MilestoneState
  skillsGained: string[]
  skills: string[]
  state: MilestoneState
}

export interface RoadmapResource {
  title: string
  type: "Documentation" | "Projects" | "Courses" | "Practice"
  description: string
  provider: string
  difficulty: string
  rating: number
}

export interface CurrentFocus {
  nextRecommendedAction: string
  reason: string
  priority: RoadmapPriority
  estimatedDuration: string
}

export interface CareerRoadmap {
  id: number
  targetRole: string
  estimatedDuration: string
  currentStage: string
  completionPercentage: number
  stages: RoadmapStage[]
  milestones: RoadmapMilestone[]
  currentFocus: CurrentFocus
  resources: RoadmapResource[]
}

export type RoadmapStageData = RoadmapStage
export type ProjectMilestone = RoadmapMilestone
export type LearningResource = RoadmapResource
