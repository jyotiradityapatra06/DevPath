import type { Metadata } from "next"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export const metadata: Metadata = {
  title: "Build your career profile",
  description: "Personalize your DevPath career intelligence experience.",
}

export default function OnboardingPage() {
  return <OnboardingFlow />
}
