function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" className="mx-auto max-w-[90rem] space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-white/[0.08] bg-[#18181B] px-6 py-10 sm:px-8">
        <SkeletonBlock className="h-6 w-44" />
        <SkeletonBlock className="mt-6 h-11 max-w-md" />
        <SkeletonBlock className="mt-4 h-5 w-72 max-w-full" />
      </section>
      <section>
        <SkeletonBlock className="mb-4 h-7 w-48" />
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="p-6"><SkeletonBlock className="size-9" /><SkeletonBlock className="mt-7 h-3 w-24" /><SkeletonBlock className="mt-3 h-7 w-32" /><SkeletonBlock className="mt-3 h-3 w-36" /></div>)}
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <SkeletonBlock className="h-[28rem]" />
        <SkeletonBlock className="h-[28rem]" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  )
}
