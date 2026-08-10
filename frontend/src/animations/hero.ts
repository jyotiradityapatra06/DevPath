import { createTimeline, stagger } from "animejs"

const heroSelectors = {
  badge: "[data-hero-badge]",
  title: "[data-hero-title]",
  description: "[data-hero-description]",
  buttons: "[data-hero-buttons]",
  visual: "[data-hero-visual]",
} as const

export function initializeHeroAnimation(root: ParentNode) {
  const timeline = createTimeline({
    defaults: { duration: 850, ease: "outExpo" },
  })

  timeline
    .add(root.querySelectorAll(heroSelectors.badge), { opacity: [0, 1], y: [-12, 0] }, 0)
    .add(root.querySelectorAll(heroSelectors.title), { opacity: [0, 1], duration: 300 }, 260)
    .add(root.querySelectorAll("[data-hero-line]"), { opacity: [0, 1], y: [34, 0], filter: ["blur(10px)", "blur(0px)"], delay: stagger(130), duration: 900 }, 300)
    .add(root.querySelectorAll(heroSelectors.description), { opacity: [0, 1], y: [20, 0] }, 600)
    .add(root.querySelectorAll(heroSelectors.buttons), { opacity: [0, 1], y: [16, 0] }, 900)
    .add(root.querySelectorAll(heroSelectors.visual), { opacity: [0, 1], y: [12, 0], scale: [0.985, 1], duration: 700 }, 150)

  return () => timeline.revert()
}
