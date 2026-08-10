import type { CareerInsight, CoachMessage } from "@/features/coach/types/coach"

export const initialMessages: CoachMessage[] = [
  { id: "message-1", role: "assistant", content: "Welcome back. I’ve reviewed your current career profile and roadmap progress. What would you like to work through today?", timestamp: "6:42 PM" },
  { id: "message-2", role: "user", content: "I want to become an AI Engineer. What should I focus on next?", timestamp: "6:43 PM" },
  { id: "message-3", role: "assistant", content: "Based on your current skills, your next highest impact area is improving machine learning fundamentals. Your backend foundation is already strong, so focus on model training, evaluation, and deployment before moving into advanced LLM systems.", timestamp: "6:43 PM" },
]

export const suggestedActions = ["Analyze my skill gaps", "Improve my roadmap", "Prepare interview strategy", "Suggest projects"] as const

export const careerInsights: CareerInsight[] = [
  { id: "insight-1", type: "Career Insight", description: "Your backend skills are strong, but ML deployment knowledge is your biggest opportunity.", priority: "High" },
  { id: "insight-2", type: "Learning Priority", description: "Focus on model deployment before advanced research topics.", priority: "Recommended" },
  { id: "insight-3", type: "Project Suggestion", description: "Build an AI-powered API platform that serves and monitors a trained model.", priority: "Strategic" },
]
