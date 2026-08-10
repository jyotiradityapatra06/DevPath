import { animate } from "animejs"

export function initializeCounters(root: ParentNode) {
  const observers: IntersectionObserver[] = []
  const animations: ReturnType<typeof animate>[] = []

  root.querySelectorAll<HTMLElement>("[data-counter]").forEach((element) => {
    const target = Number(element.dataset.counter)
    if (!Number.isFinite(target)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const value = { current: 0 }
        animations.push(
          animate(value, {
            current: target,
            duration: 1400,
            ease: "outExpo",
            onUpdate: () => {
              element.textContent = Math.round(value.current).toString()
            },
          }),
        )
        observer.disconnect()
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
    observers.push(observer)
  })

  return () => {
    observers.forEach((observer) => observer.disconnect())
    animations.forEach((animation) => animation.revert())
  }
}
