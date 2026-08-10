export type MessageRole = "assistant" | "user"
export type InsightPriority = "High" | "Recommended" | "Strategic"

export interface CoachMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface CareerInsight {
  id: string
  type: "Career Insight" | "Learning Priority" | "Project Suggestion"
  description: string
  priority: InsightPriority
}
