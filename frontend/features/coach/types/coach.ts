export type MessageRole = "assistant" | "user"
export type InsightPriority = "High" | "Recommended" | "Strategic"

export interface CoachMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface CoachInsight {
  title: string
  description: string
  priority: InsightPriority
}

export interface SuggestedAction {
  label: string
  action: string
}

export interface CoachResponse {
  conversationId: number
  message: CoachMessage
  insights: CoachInsight[]
  suggestedActions: SuggestedAction[]
}

export interface CoachConversation {
  id: number
  messages: CoachMessage[]
}

export interface CoachContext {
  targetRole: string
  experienceLevel: string
  skills: string[]
  roadmapProgress: number
  currentFocus: string
}
