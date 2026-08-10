function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />
}

export function SkillSkeleton() {
  return (
    <div aria-label="Loading skill intelligence" className="mx-auto max-w-[90rem] space-y-7 sm:space-y-9">
      <header className="border-b border-white/[0.07] pb-7"><Skeleton className="h-4 w-44" /><Skeleton className="mt-5 h-10 w-72 max-w-full" /><Skeleton className="mt-4 h-5 w-80 max-w-full" /></header>
      <section className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="p-6"><Skeleton className="size-5" /><Skeleton className="mt-7 h-3 w-28" /><Skeleton className="mt-3 h-8 w-20" /></div>)}</section>
      <section className="grid min-h-[34rem] rounded-3xl border border-white/[0.08] bg-[#18181B]/75 lg:grid-cols-[1fr_15rem]"><div className="relative min-h-[28rem] bg-[#111113]">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="absolute" style={{ left: `${20 + (item % 3) * 30}%`, top: `${20 + Math.floor(item / 3) * 48}%` }}><Skeleton className="h-12 w-28 -translate-x-1/2" /></div>)}</div><div className="border-l border-white/[0.07] p-6"><Skeleton className="h-5 w-20" /><Skeleton className="mt-8 h-8 w-32" /><Skeleton className="mt-4 h-4 w-full" /></div></section>
      <section><Skeleton className="h-8 w-64" /><div className="mt-5 grid gap-4 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></section>
    </div>
  )
}
