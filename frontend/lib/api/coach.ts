import type { CoachConversation, CoachMessage, CoachResponse, SuggestedAction } from "@/features/coach/types/coach"
import { apiClient } from "@/lib/api/client"

interface ConversationSummaryResponse { id: number; title: string }
interface ConversationMessageResponse { id: number; role: "system" | "user" | "assistant"; content: string; created_at: string }
interface ConversationDetailResponse extends ConversationSummaryResponse { messages: ConversationMessageResponse[] }
interface CoachApiResponse {
  conversation_id: number
  response: string
  timestamp: string
  insights: Array<{ title: string; description: string; priority: "High" | "Recommended" | "Strategic" }>
  suggested_actions: SuggestedAction[]
}

export interface SendCoachMessageInput {
  conversationId: number
  message: string
  history?: CoachMessage[]
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value))
}

function toMessage(message: ConversationMessageResponse): CoachMessage | null {
  if (message.role === "system") return null
  return {
    id: String(message.id),
    role: message.role,
    content: message.content,
    timestamp: formatTimestamp(message.created_at),
  }
}

export async function getCoachConversation(): Promise<CoachConversation> {
  const conversations = (await apiClient.get<ConversationSummaryResponse[]>("/api/v1/conversations")).data
  let conversation = conversations.find((item) => item.title === "AI Career Coach") ?? conversations[0]
  if (!conversation) {
    conversation = (await apiClient.post<ConversationSummaryResponse>("/api/v1/conversations", { title: "AI Career Coach" })).data
  }
  const detail = (await apiClient.get<ConversationDetailResponse>(`/api/v1/conversations/${conversation.id}`)).data
  return { id: detail.id, messages: detail.messages.flatMap((message) => {
    const mapped = toMessage(message)
    return mapped ? [mapped] : []
  }) }
}

export async function sendCoachMessage(input: SendCoachMessageInput): Promise<CoachResponse> {
  const { data } = await apiClient.post<CoachApiResponse>("/api/v1/coach/chat", {
    conversation_id: input.conversationId,
    message: input.message,
  })
  return {
    conversationId: data.conversation_id,
    message: {
      id: `assistant-${data.conversation_id}-${data.timestamp}`,
      role: "assistant",
      content: data.response,
      timestamp: formatTimestamp(data.timestamp),
    },
    insights: data.insights,
    suggestedActions: data.suggested_actions,
  }
}
