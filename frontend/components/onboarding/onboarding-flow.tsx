"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Blocks, BookOpen, BrainCircuit, Check, Cloud, Code2, FlaskConical, Layers3, LoaderCircle, Rocket, SearchCheck, Server, Sparkles, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { OnboardingNavigation } from "@/components/onboarding/onboarding-navigation"
import { OptionCard } from "@/components/onboarding/option-card"
import { ProgressBar } from "@/components/onboarding/progress-bar"
import { SkillSelector } from "@/components/onboarding/skill-selector"
import { StepContainer } from "@/components/onboarding/step-container"
import { BrandMark } from "@/components/shared/brand-mark"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding"
import { useSaveCareerGoal } from "@/features/onboarding/hooks/use-save-career-goal"
import { useSaveCareerProfile } from "@/features/onboarding/hooks/use-save-career-profile"
import { useSaveSkills } from "@/features/onboarding/hooks/use-save-skills"
import type { OnboardingData } from "@/features/onboarding/types/onboarding"
import { getApiErrorMessage } from "@/lib/api/client"

const totalSteps = 6

const careerGoals = [
  { label: "Software Engineer", icon: Code2 },
  { label: "AI/ML Engineer", icon: BrainCircuit },
  { label: "Data Scientist", icon: FlaskConical },
  { label: "Backend Developer", icon: Server },
  { label: "Full Stack Developer", icon: Layers3 },
  { label: "Cloud Engineer", icon: Cloud },
]

const experienceLevels = [
  { label: "Beginner", description: "I am building my foundations.", icon: Rocket },
  { label: "Intermediate", description: "I have practical experience and want direction.", icon: Blocks },
  { label: "Advanced", description: "I want to deepen expertise and sharpen my edge.", icon: Target },
]

const learningPreferences = [
  { label: "Project based", description: "Learn through building and real implementation.", icon: Blocks },
  { label: "Theory first", description: "Understand concepts before applying them.", icon: BookOpen },
  { label: "Interview focused", description: "Prioritize role readiness and interview patterns.", icon: SearchCheck },
  { label: "Research oriented", description: "Explore deeply through papers and experimentation.", icon: FlaskConical },
]

export function OnboardingFlow() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<OnboardingData>({
    careerIntent: "Career growth",
    targetRole: "",
    experienceLevel: "",
    skills: [],
    learningPreference: "",
  })
  const [error, setError] = useState<string | null>(null)
  const profileMutation = useSaveCareerProfile()
  const goalMutation = useSaveCareerGoal()
  const skillsMutation = useSaveSkills()
  const completeMutation = useCompleteOnboarding()
  const isSaving = profileMutation.isPending || goalMutation.isPending || skillsMutation.isPending

  useEffect(() => {
    if (user?.onboarding_completed) router.replace("/app")
  }, [router, user?.onboarding_completed])

  const canContinue =
    step === 1 ||
    (step === 2 && Boolean(state.targetRole)) ||
    (step === 3 && Boolean(state.experienceLevel)) ||
    (step === 4 && state.skills.length > 0) ||
    (step === 5 && Boolean(state.learningPreference))

  async function handleContinue() {
    if (!canContinue || isSaving) return
    setError(null)
    try {
      if (step === 1) await profileMutation.mutateAsync({ careerIntent: state.careerIntent })
      if (step === 2) await goalMutation.mutateAsync({ targetRole: state.targetRole })
      if (step === 3) await Promise.all([
        profileMutation.mutateAsync({ experienceLevel: state.experienceLevel }),
        goalMutation.mutateAsync({ targetRole: state.targetRole, experienceLevel: state.experienceLevel }),
      ])
      if (step === 4) await skillsMutation.mutateAsync({ skills: state.skills, experienceLevel: state.experienceLevel })
      if (step === 5) await Promise.all([
        profileMutation.mutateAsync({ learningPreference: state.learningPreference }),
        goalMutation.mutateAsync({ targetRole: state.targetRole, experienceLevel: state.experienceLevel, learningPreference: state.learningPreference }),
      ])
      setStep((current) => Math.min(totalSteps, current + 1))
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "We couldn't save this step. Please try again."))
    }
  }

  async function handleComplete() {
    setError(null)
    try {
      await completeMutation.mutateAsync()
      router.replace("/app")
      router.refresh()
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "We couldn't complete your profile. Please try again."))
    }
  }

  return (
    <main className="dark relative min-h-screen overflow-hidden bg-[#09090B] px-4 py-5 text-[#FAFAFA] sm:px-6 sm:py-8">
      <div className="aurora-mesh pointer-events-none absolute inset-0 opacity-50" />
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between"><BrandMark inverse href="/" /><p className="hidden text-xs text-[#71717A] sm:block">Private, personalized, built around you.</p></header>
        <div className="my-auto py-10 sm:py-12"><div className="mx-auto max-w-3xl">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
          <div className="mt-8 min-h-[30rem] rounded-[1.75rem] border border-white/[0.09] bg-[#111113]/90 p-5 shadow-[0_36px_110px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:mt-10 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait"><div key={step}>
              {step === 1 && <StepContainer eyebrow="Welcome to DevPath" title="Let's understand your career journey." description="DevPath will analyze your goals, skills, and experience to build your personalized career path."><div className="grid gap-3 sm:grid-cols-3">{[{ icon: Target, label: "Your direction", color: "text-[#A78BFA]" }, { icon: BrainCircuit, label: "Your intelligence", color: "text-[#6EE7B7]" }, { icon: Sparkles, label: "Your path", color: "text-[#FBBF24]" }].map(({ icon: Icon, label, color }) => <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#18181B] p-4"><Icon className={`size-5 ${color}`} /><p className="mt-5 text-sm font-medium text-white">{label}</p></div>)}</div></StepContainer>}
              {step === 2 && <StepContainer eyebrow="Career goal" title="Where do you want to go?" description="Choose the role that best matches the direction you want to build toward."><div className="grid gap-3 sm:grid-cols-2">{careerGoals.map((option) => <OptionCard key={option.label} {...option} selected={state.targetRole === option.label} onSelect={() => setState((current) => ({ ...current, targetRole: option.label }))} />)}</div></StepContainer>}
              {step === 3 && <StepContainer eyebrow="Experience level" title="Where are you starting from?" description="This helps DevPath shape recommendations at the right depth and pace."><div className="grid gap-3">{experienceLevels.map((option) => <OptionCard key={option.label} {...option} selected={state.experienceLevel === option.label} onSelect={() => setState((current) => ({ ...current, experienceLevel: option.label }))} />)}</div></StepContainer>}
              {step === 4 && <StepContainer eyebrow="Current skills" title="What do you already know?" description="Select the skills that represent your current toolkit. You can refine levels later."><SkillSelector selected={state.skills} onChange={(skills) => setState((current) => ({ ...current, skills }))} /></StepContainer>}
              {step === 5 && <StepContainer eyebrow="Learning preference" title="How do you learn best?" description="Choose the style that should influence how your growth path is presented."><div className="grid gap-3 sm:grid-cols-2">{learningPreferences.map((option) => <OptionCard key={option.label} {...option} selected={state.learningPreference === option.label} onSelect={() => setState((current) => ({ ...current, learningPreference: option.label }))} />)}</div></StepContainer>}
              {step === 6 && <StepContainer eyebrow="Profile complete" title="Your AI career profile is ready." description="DevPath now has the foundation it needs to shape a career experience around your direction."><div className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-[#10B981]/[0.06] p-6 text-center sm:p-8"><motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 14 }} className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 text-[#6EE7B7]"><Check className="size-8" /></motion.div><p className="mt-6 text-sm text-[#A1A1AA]">{state.targetRole} · {state.experienceLevel} · {state.skills.length} skills</p><button type="button" onClick={handleComplete} disabled={completeMutation.isPending} className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-[#8B5CF6] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#9D74F7] hover:shadow-xl hover:shadow-[#8B5CF6]/20 disabled:pointer-events-none disabled:opacity-60">{completeMutation.isPending ? <><LoaderCircle className="size-4 animate-spin" />Creating your AI career profile...</> : <>Enter DevPath <ArrowRight className="size-4" /></>}</button></div></StepContainer>}
            </div></AnimatePresence>
            {error && <p role="alert" className="mt-6 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.07] px-4 py-3 text-sm text-[#FCD34D]">{error}</p>}
            {step < totalSteps && <OnboardingNavigation canContinue={canContinue} isFirstStep={step === 1} onBack={() => setStep((current) => Math.max(1, current - 1))} onContinue={handleContinue} isSaving={isSaving} />}
          </div>
        </div></div>
      </div>
    </main>
  )
}
