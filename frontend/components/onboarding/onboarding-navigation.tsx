import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface OnboardingNavigationProps {
  canContinue: boolean
  isFirstStep: boolean
  onBack: () => void
  onContinue: () => void
  isSaving?: boolean
}

export function OnboardingNavigation({
  canContinue,
  isFirstStep,
  onBack,
  onContinue,
  isSaving = false,
}: OnboardingNavigationProps) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-6 sm:mt-10">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={onBack}
        disabled={isFirstStep || isSaving}
        className="h-11 rounded-xl px-4 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft /> Back
      </Button>
      <Button
        type="button"
        size="lg"
        onClick={onContinue}
        disabled={!canContinue || isSaving}
        className="h-11 rounded-xl bg-[#8B5CF6] px-5 text-white hover:bg-[#9D74F7] disabled:bg-white/10 disabled:text-[#52525B]"
      >
        {isSaving ? "Creating your AI career profile..." : <>Continue <ArrowRight /></>}
      </Button>
    </div>
  )
}
