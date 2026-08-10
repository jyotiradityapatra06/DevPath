import { animate, stagger } from "animejs"

const revealSelector = "[data-scroll-reveal]"
const staggerItemSelector = "[data-reveal-item]"

export function initializeScrollReveals(root: ParentNode) {
  const observers: IntersectionObserver[] = []
  const animations: ReturnType<typeof animate>[] = []

  root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const items = element.querySelectorAll<HTMLElement>(staggerItemSelector)
        animations.push(
          animate(element, { opacity: [0, 1], y: [28, 0], duration: 760, ease: "outExpo" }),
        )

        if (items.length > 0) {
          animations.push(
            animate(items, {
              opacity: [0, 1],
              y: [18, 0],
              delay: stagger(90),
              duration: 680,
              ease: "outExpo",
            }),
          )
        }

        observer.disconnect()
      },
      { rootMargin: "0px 0px -10%", threshold: 0.14 },
    )

    observer.observe(element)
    observers.push(observer)
  })

  return () => {
    observers.forEach((observer) => observer.disconnect())
    animations.forEach((animation) => animation.revert())
  }
}
