import { animate, stagger } from "animejs"

export function initializeParticles(root: ParentNode) {
  const particles = root.querySelectorAll<HTMLElement>("[data-motion-particle]")
  if (particles.length === 0) return () => undefined

  const animation = animate(particles, {
    y: [0, -6, 0],
    delay: stagger(240),
    duration: 5200,
    ease: "inOutSine",
    loop: true,
  })

  return () => animation.revert()
}
