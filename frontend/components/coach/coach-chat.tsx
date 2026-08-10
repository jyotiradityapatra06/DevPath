"use client"

import axios from "axios"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp, Sparkles } from "lucide-react"

import { MessageBubble } from "@/components/coach/message-bubble"
import { SuggestedActions } from "@/components/coach/suggested-actions"
import { TypingIndicator } from "@/components/coach/typing-indicator"
import { useCoachConversation, useSendCoachMessage } from "@/features/coach/hooks/use-coach"
import type { CoachInsight, CoachMessage, SuggestedAction } from "@/features/coach/types/coach"
import { getApiErrorMessage } from "@/lib/api/client"

interface CoachChatProps {
  initialActions: SuggestedAction[]
  onInsightsChange: (insights: CoachInsight[]) => void
}

export function CoachChat({ initialActions, onInsightsChange }: CoachChatProps) {
  const conversationQuery = useCoachConversation()
  const sendMutation = useSendCoachMessage()
  const [sessionMessages, setSessionMessages] = useState<CoachMessage[]>([])
  const [responseActions, setResponseActions] = useState<SuggestedAction[] | null>(null)
  const [draft, setDraft] = useState("")
  const [failedMessage, setFailedMessage] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const persistedMessages = conversationQuery.data?.messages
  const messages = useMemo(() => [...(persistedMessages ?? []), ...sessionMessages], [persistedMessages, sessionMessages])
  const actions = responseActions ?? initialActions
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sendMutation.isPending])

  async function send(content: string, appendUser: boolean) {
    if (!conversationQuery.data || sendMutation.isPending) return
    if (appendUser) {
      setSessionMessages((current) => [...current, { id: `local-${crypto.randomUUID()}`, role: "user", content, timestamp: "Now" }])
    }
    setFailedMessage(null)
    try {
      const response = await sendMutation.mutateAsync({ conversationId: conversationQuery.data.id, message: content, history: messages })
      setSessionMessages((current) => [...current, response.message])
      setResponseActions(response.suggestedActions)
      onInsightsChange(response.insights)
    } catch {
      setFailedMessage(content)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft("")
    void send(content, true)
  }

  const error = sendMutation.error
  const errorMessage = axios.isAxiosError(error) && error.response?.status === 429
    ? "Your coach is receiving a lot of requests. Please wait a moment and try again."
    : axios.isAxiosError(error) && error.response?.status === 502
      ? "Your AI coach is temporarily unavailable."
      : error ? getApiErrorMessage(error, "Your AI coach is temporarily unavailable.") : null

  return <section className="flex min-h-[38rem] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111113]/80 shadow-[0_28px_80px_-52px_rgba(139,92,246,0.35)] sm:min-h-[42rem]"><header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Career conversation</h2><p className="mt-1 text-xs text-[#71717A]">Guidance grounded in your DevPath profile</p></div><Sparkles className="size-4 text-[#A78BFA]" /></header><div className="flex-1 scroll-smooth space-y-6 overflow-y-auto p-4 sm:p-6" aria-live="polite">{conversationQuery.isPending && <p className="py-10 text-center text-sm text-[#71717A]">Loading your conversation...</p>}{conversationQuery.error && <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.07] p-4 text-sm text-[#FCD34D]">We couldn&apos;t load your conversation. <button type="button" onClick={() => conversationQuery.refetch()} className="ml-1 font-semibold underline">Try again</button></div>}{!conversationQuery.isPending && !conversationQuery.error && messages.length === 0 && <div className="py-12 text-center"><Sparkles className="mx-auto size-6 text-[#A78BFA]" /><p className="mt-4 text-sm font-medium text-white">Your AI Career Coach is ready.</p><p className="mt-2 text-xs text-[#71717A]">Ask about your career direction, skills, roadmap, or next project.</p></div>}{messages.map((message, index) => <MessageBubble key={message.id} message={message} index={index} />)}{sendMutation.isPending && <TypingIndicator />}{errorMessage && <div role="alert" className="ml-11 rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.07] p-4 text-sm text-[#FCD34D]"><p>{errorMessage}</p>{failedMessage && <button type="button" onClick={() => void send(failedMessage, false)} className="mt-2 font-semibold text-white underline">Retry</button>}</div>}<div ref={endRef} /></div><div className="border-t border-white/[0.07] bg-[#09090B]/55 p-4 sm:p-5">{actions.length > 0 && <SuggestedActions actions={actions} onSelect={setDraft} />}<form onSubmit={submit} className="mt-4 flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-[#18181B] p-2 transition-[border-color,box-shadow] focus-within:border-[#8B5CF6]/45 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"><label htmlFor="coach-message" className="sr-only">Message your AI career coach</label><textarea id="coach-message" rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about your career direction..." className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#52525B]" /><button type="submit" disabled={!draft.trim() || !conversationQuery.data || sendMutation.isPending} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8B5CF6] text-white transition-[transform,background-color] hover:bg-[#7C3AED] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp className="size-4" /></button></form><p className="mt-2 text-center text-[10px] text-[#52525B]">Responses use your saved DevPath career context.</p></div></section>
}
