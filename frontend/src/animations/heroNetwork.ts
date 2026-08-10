import { animate, createDrawable, createTimeline, stagger, svg } from "animejs"

type Cleanup = () => void

export function initializeHeroNetwork(root: HTMLElement) {
  const network = root.querySelector<HTMLElement>("[data-network-parallax]")
  if (!network) return () => undefined

  const growthPath = network.querySelector<SVGPathElement>("#path-growth")
  const skillPaths = network.querySelectorAll<SVGPathElement>("[data-skill-id]")
  const checkpoints = network.querySelectorAll<SVGGElement>("[data-career-checkpoint]")
  const nodes = network.querySelectorAll<HTMLElement>("[data-network-node]")
  const orb = network.querySelector<HTMLElement>("[data-ai-orb]")
  const glowLayers = network.querySelectorAll<HTMLElement>("[data-orb-glow], [data-orb-ambient]")
  const rings = network.querySelectorAll<HTMLElement>("[data-orb-ring]")
  const coreLayers = network.querySelectorAll<HTMLElement>("[data-orb-core], [data-orb-symbol]")
  const particles = network.querySelectorAll<SVGCircleElement>("[data-network-particle]")
  const ambientParticles = network.querySelectorAll<HTMLElement>("[data-ambient-particle]")
  const timeline = createTimeline({ defaults: { ease: "outExpo" } })
  const idleAnimations: ReturnType<typeof animate>[] = []
  const cleanupInteractions: Cleanup[] = []

  if (growthPath) timeline.add(createDrawable(growthPath), { draw: ["0 0", "0 1"], duration: 1150 }, 0)
  if (checkpoints.length) timeline.add(checkpoints, { opacity: [0, 1], scale: [0.35, 1], delay: stagger(500), duration: 620, ease: "outBack" }, 1000)
  if (orb) timeline.add(orb, { opacity: [0, 1], scale: [0, 1], filter: ["blur(16px)", "blur(0px)"], duration: 1050, ease: "outElastic(1, .65)" }, 2000)
  if (skillPaths.length) timeline.add(createDrawable(skillPaths), { draw: ["0 0", "0 1"], opacity: [0.15, 0.65], delay: stagger(85), duration: 1100 }, 2500)
  if (nodes.length) timeline.add(nodes, { opacity: [0, 1], scale: [0.68, 1], rotate: [-4, 0], filter: ["blur(8px)", "blur(0px)"], delay: stagger(105), duration: 760 }, 2700)
  if (particles.length) timeline.add(particles, { opacity: [0, 1], duration: 500 }, 2850)

  const startIdleAnimations = () => {
    if (orb) idleAnimations.push(animate(orb, { scale: [1, 1.05, 1], opacity: [0.94, 1, 0.94], duration: 4700, ease: "inOutSine", loop: true }))
    glowLayers.forEach((layer, index) => idleAnimations.push(animate(layer, { opacity: [0.38 + index * 0.08, 0.72 + index * 0.08, 0.42], scale: [0.92, 1.1 + index * 0.025, 0.94], duration: 3300 + Math.round(Math.random() * 1100), ease: "inOutSine", loop: true })))
    if (rings.length) idleAnimations.push(animate(rings, { rotate: [0, 360], scale: [0.98, 1.04, 0.98], delay: stagger(420), duration: 14000, ease: "linear", loop: true }))
    if (coreLayers.length) idleAnimations.push(animate(coreLayers, { scale: [0.96, 1.035, 0.96], opacity: [0.82, 1, 0.82], delay: stagger(180), duration: 3100, ease: "inOutSine", loop: true }))
    if (nodes.length) idleAnimations.push(animate(nodes, { y: [0, -6, 0], delay: stagger(310), duration: 4400, ease: "inOutSine", loop: true }))
    if (skillPaths.length) idleAnimations.push(animate(skillPaths, { opacity: [0.4, 0.72, 0.4], delay: stagger(260), duration: 3600, ease: "inOutSine", loop: true }))
    if (ambientParticles.length) idleAnimations.push(animate(ambientParticles, { y: [0, -18, 0], x: [0, 5, 0], opacity: [0.08, 0.34, 0.08], delay: stagger(430), duration: 6200, ease: "inOutSine", loop: true }))

    particles.forEach((particle, index) => {
      const path = particle.dataset.pathId ? network.querySelector<SVGPathElement>(`#${particle.dataset.pathId}`) : null
      if (path) idleAnimations.push(animate(particle, { ...svg.createMotionPath(path), opacity: [0.25, 1, 0.25], duration: 3000 + index * 240, delay: index * 280, ease: "linear", loop: true }))
    })
  }
  timeline.call(startIdleAnimations, 4100)

  const nodeStates = Array.from(nodes, (node, index) => ({
    node,
    surface: node.querySelector<HTMLElement>("[data-node-surface]"),
    path: network.querySelector<SVGPathElement>(`[data-skill-id="${node.dataset.nodeId}"]`),
    depth: 0.42 + index * 0.1,
  }))
  let targetX = 0
  let targetY = 0
  let currentX = 0
  let currentY = 0
  let frameId: number | null = null

  const renderParallax = () => {
    currentX += (targetX - currentX) * 0.075
    currentY += (targetY - currentY) * 0.075
    const intensity = window.innerWidth < 768 ? 3 : window.innerWidth < 1024 ? 6 : 10
    network.style.translate = `${currentX * intensity}px ${currentY * intensity * 0.8}px`
    if (orb) orb.style.translate = `${currentX * -3}px ${currentY * -3}px`
    nodeStates.forEach(({ node, depth }) => { node.style.translate = `${currentX * intensity * depth}px ${currentY * intensity * depth}px` })
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.005) frameId = requestAnimationFrame(renderParallax)
    else frameId = null
  }

  const handlePointerMove = (event: PointerEvent) => {
    const bounds = network.getBoundingClientRect()
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5
    if (frameId === null) frameId = requestAnimationFrame(renderParallax)

    nodeStates.forEach(({ node, surface, path }) => {
      if (!surface) return
      const nodeBounds = node.getBoundingClientRect()
      const distance = Math.hypot(event.clientX - (nodeBounds.left + nodeBounds.width / 2), event.clientY - (nodeBounds.top + nodeBounds.height / 2))
      const proximity = Math.max(0, 1 - distance / 150)
      surface.style.transform = `scale(${1 + proximity * 0.075})`
      surface.style.boxShadow = proximity > 0.05 ? `0 0 ${18 + proximity * 20}px rgba(139, 92, 246, ${0.08 + proximity * 0.16})` : ""
      if (path) { path.style.strokeWidth = proximity > 0.05 ? `${1.4 + proximity}px` : ""; path.style.filter = proximity > 0.05 ? "drop-shadow(0 0 5px currentColor)" : "" }
    })
  }

  const resetInteraction = () => {
    targetX = 0
    targetY = 0
    if (frameId === null) frameId = requestAnimationFrame(renderParallax)
    nodeStates.forEach(({ surface, path }) => { if (surface) { surface.style.transform = ""; surface.style.boxShadow = "" } if (path) { path.style.strokeWidth = ""; path.style.filter = "" } })
  }
  if (window.matchMedia("(pointer: fine)").matches) {
    network.addEventListener("pointermove", handlePointerMove)
    network.addEventListener("pointerleave", resetInteraction)
    cleanupInteractions.push(() => { network.removeEventListener("pointermove", handlePointerMove); network.removeEventListener("pointerleave", resetInteraction) })
  }

  return () => {
    cleanupInteractions.forEach((cleanup) => cleanup())
    if (frameId !== null) cancelAnimationFrame(frameId)
    network.style.translate = ""
    if (orb) orb.style.translate = ""
    nodeStates.forEach(({ node, surface }) => { node.style.translate = ""; if (surface) { surface.style.transform = ""; surface.style.boxShadow = "" } })
    timeline.revert()
    idleAnimations.forEach((animation) => animation.revert())
  }
}
