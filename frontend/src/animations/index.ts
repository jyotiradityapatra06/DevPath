import { initializeCounters } from "./counters"
import { initializeHeroAnimation } from "./hero"
import { initializeHeroNetwork } from "./heroNetwork"
import { initializeParticles } from "./particles"
import { initializeScrollReveals } from "./scrollReveal"

export { initializeCounters } from "./counters"
export { initializeHeroAnimation } from "./hero"
export { initializeHeroNetwork } from "./heroNetwork"
export { initializeParticles } from "./particles"
export { initializeScrollReveals } from "./scrollReveal"

export function initializeLandingAnimations(root: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.motionReady = "true"
    return () => undefined
  }

  root.dataset.motionReady = "true"
  const cleanups = [
    initializeHeroAnimation(root),
    initializeHeroNetwork(root),
    initializeScrollReveals(root),
    initializeCounters(root),
    initializeParticles(root),
  ]

  return () => cleanups.forEach((cleanup) => cleanup())
}
