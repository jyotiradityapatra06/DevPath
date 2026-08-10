function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />
}

export function RoadmapSkeleton() {
  return (
    <div aria-label="Loading career roadmap" className="mx-auto max-w-[90rem] space-y-8 sm:space-y-10">
      <header className="border-b border-white/[0.07] pb-7"><Skeleton className="h-4 w-48" /><Skeleton className="mt-5 h-10 w-96 max-w-full" /><Skeleton className="mt-4 h-5 w-80 max-w-full" /><Skeleton className="mt-7 h-2 max-w-xl" /></header>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]"><div className="space-y-4"><Skeleton className="mb-6 h-8 w-64" />{[0, 1, 2].map((item) => <div key={item} className="rounded-3xl border border-white/[0.08] bg-[#18181B]/75 p-6"><Skeleton className="h-3 w-24" /><Skeleton className="mt-4 h-7 w-52" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-6 h-2 w-full" /></div>)}</div><Skeleton className="h-80" /></section>
      <section><Skeleton className="h-8 w-56" /><div className="mt-5 grid gap-4 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div></section>
    </div>
  )
}
