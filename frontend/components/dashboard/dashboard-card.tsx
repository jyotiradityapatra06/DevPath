import { cn } from "@/lib/utils"

interface DashboardCardProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function DashboardCard({
  title,
  description,
  action,
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "premium-surface overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/75 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.8)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div>
            {title && <h2 className="text-base font-semibold tracking-[-0.02em] text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-[#71717A]">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
