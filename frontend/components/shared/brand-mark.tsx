import { Orbit } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function BrandMark({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link href="/app" aria-label="DevPath home" className={cn("inline-flex items-center gap-2.5 font-semibold tracking-[-0.02em]", inverse ? "text-white" : "text-foreground")}>
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan text-white shadow-lg shadow-primary/20"><Orbit className="size-5" /></span>
      {!compact && <span className="text-lg">DevPath</span>}
    </Link>
  )
}
