export type SkillState = "strong" | "learning" | "missing"
export type SkillPriority = "HIGH" | "MEDIUM" | "LOW"

export interface SkillNode {
  id: string
  name: string
  state: SkillState
  x: number
  y: number
  level: number
  note: string
}

export interface SkillConnection {
  from: string
  to: string
}

export interface SkillGap {
  name: string
  priority: SkillPriority
  current: number
  required: number
  action: string
}

export interface LearningStep {
  title: string
  reason: string
  impact: SkillPriority
  estimate: string
  category: string
}
