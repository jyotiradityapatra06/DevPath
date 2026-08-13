"use client"

import { Bot, UserRound } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import type { CoachMessage } from "@/features/coach/types/coach"

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="mb-1.5 mt-3 text-base font-semibold tracking-tight text-white">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mb-1 mt-2.5 text-sm font-semibold tracking-tight text-white">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mb-1 mt-2 text-xs font-semibold tracking-tight text-white">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="mb-2 leading-relaxed text-[#D4D4D8] last:mb-0">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="my-2 ml-4 list-disc space-y-1 text-[#D4D4D8]">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-2 ml-4 list-decimal space-y-1 text-[#D4D4D8]">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-[#E4E4E7]">{children}</em>
  ),
  code: ({ className, children, ...props }: any) => {
    const isBlock = String(children).includes("\n") || Boolean(className)
    if (!isBlock) {
      return (
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#C4B5FD]" {...props}>
          {children}
        </code>
      )
    }
    return (
      <pre className="my-2.5 overflow-x-auto rounded-xl border border-white/10 bg-[#09090B] p-3 font-mono text-xs text-[#E4E4E7]">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    )
  },
  a: ({ href, children }: any) => {
    const isExternal = href?.startsWith("http://") || href?.startsWith("https://")
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="font-medium text-[#A78BFA] underline underline-offset-2 transition-colors hover:text-[#C4B5FD]"
      >
        {children}
      </a>
    )
  },
}

export function MessageBubble({ message, index }: { message: CoachMessage; index: number }) {
  const assistant = message.role === "assistant"
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn("flex gap-3", !assistant && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-xl border",
          assistant
            ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]"
            : "border-white/10 bg-white/[0.05] text-[#D4D4D8]",
        )}
      >
        {assistant ? <Bot className="size-4" /> : <UserRound className="size-4" />}
      </div>
      <div className={cn("max-w-[85%] sm:max-w-[78%]", !assistant && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left text-sm leading-6",
            assistant
              ? "rounded-tl-md border border-white/[0.08] bg-[#18181B] text-[#D4D4D8]"
              : "rounded-tr-md bg-[#8B5CF6] text-white shadow-[0_12px_35px_-20px_rgba(139,92,246,0.65)]",
          )}
        >
          {assistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-[#52525B]">
          {assistant ? "DevPath Coach" : "You"} · {message.timestamp}
        </p>
      </div>
    </motion.article>
  )
}
