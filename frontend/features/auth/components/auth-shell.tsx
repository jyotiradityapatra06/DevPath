import { BrainCircuit, ShieldCheck, Sparkles } from "lucide-react"

import { BrandMark } from "@/components/shared/brand-mark"

const highlights = [
  { icon: BrainCircuit, label: "Context-aware career intelligence" },
  { icon: Sparkles, label: "Personalized learning direction" },
  { icon: ShieldCheck, label: "Secure, private workspace" },
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex lg:flex-col">
        <div className="absolute -left-28 top-16 size-72 rounded-full bg-brand-violet/25 blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-brand-cyan/20 blur-3xl" />
        <BrandMark inverse />
        <div className="relative my-auto max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-cyan">
            Your career operating system
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">
            Turn ambition into a clear path forward.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-sidebar-foreground/65">
            DevPath brings your goals, skills, progress, and AI guidance into one
            focused workspace.
          </p>
          <div className="mt-12 grid gap-4">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <Icon className="size-4 text-brand-cyan" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-sidebar-foreground/40">DevPath · Career intelligence, thoughtfully applied.</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><BrandMark /></div>
          {children}
        </div>
      </section>
    </main>
  )
}
