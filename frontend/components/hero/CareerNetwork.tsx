import { AIOrb } from "./AIOrb"
import { SkillNode } from "./SkillNode"

const paths = [
  { id: "path-python", d: "M300 300 C245 226 198 140 151 82", color: "#10B981" },
  { id: "path-react", d: "M300 300 C309 213 318 128 339 67", color: "#10B981" },
  { id: "path-backend", d: "M300 300 C381 238 446 180 519 152", color: "#22D3EE" },
  { id: "path-ai", d: "M300 300 C384 322 448 357 526 397", color: "#F59E0B" },
  { id: "path-system", d: "M300 300 C330 379 356 441 388 516", color: "#F59E0B" },
]

const growthPath = "M35 532 C104 510 133 500 170 456 C207 414 225 397 244 356 C263 323 278 315 300 300"

export function CareerNetwork() {
  return (
    <div data-network-parallax className="relative mx-auto aspect-square w-full max-w-[38rem]" aria-label="AI-powered career skill network">
      <div className="absolute inset-[8%] rounded-full border border-white/[0.035]" /><div className="absolute inset-[20%] rounded-full border border-[#8B5CF6]/10" /><div className="landing-grid absolute inset-0 opacity-25" />
      <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 600 600" fill="none" aria-hidden="true">
        <defs><linearGradient id="career-path-gradient" x1="70" y1="100" x2="540" y2="510" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE" stopOpacity="0.35" /><stop offset="0.5" stopColor="#A78BFA" /><stop offset="1" stopColor="#8B5CF6" stopOpacity="0.35" /></linearGradient><filter id="career-path-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <path d={growthPath} stroke="#8B5CF6" strokeOpacity="0.12" strokeWidth="11" filter="url(#career-path-glow)" />
        <path id="path-growth" data-network-path d={growthPath} stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" filter="url(#career-path-glow)" />
        {[{ x: 93, y: 507 }, { x: 172, y: 454 }, { x: 244, y: 356 }].map((point, index) => <g data-career-checkpoint key={`${point.x}-${point.y}`}><circle cx={point.x} cy={point.y} r="13" fill="#8B5CF6" fillOpacity="0.16" stroke="#A78BFA" strokeOpacity="0.5" /><circle cx={point.x} cy={point.y} r="4" fill="#DDD6FE" filter="url(#career-path-glow)" /><circle data-checkpoint-ring cx={point.x} cy={point.y} r={18 + index} stroke="#A78BFA" strokeOpacity="0.12" /></g>)}
        {paths.map((path) => <g key={path.id}><path d={path.d} stroke={path.color} strokeOpacity="0.06" strokeWidth="8" /><path id={path.id} data-network-path data-skill-id={path.id.replace("path-", "")} d={path.d} stroke={path.color} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" filter="url(#career-path-glow)" /></g>)}
        <circle data-network-particle data-path-id="path-growth" r="4" fill="#DDD6FE" filter="url(#career-path-glow)" />
        {paths.map((path) => <circle key={`particle-${path.id}`} data-network-particle data-path-id={path.id} r="3.5" fill="#C4B5FD" filter="url(#career-path-glow)" />)}
      </svg>
      <div data-atmosphere aria-hidden="true" className="absolute inset-0">{[14, 23, 39, 58, 72, 84].map((position, index) => <span data-ambient-particle key={position} className="absolute size-1 rounded-full bg-white/30 blur-[0.5px]" style={{ left: `${position}%`, top: `${18 + (index * 17) % 68}%` }} />)}</div>
      <AIOrb />
      <SkillNode id="python" label="Python" accent="emerald" position="left-[25%] top-[13%]" /><SkillNode id="react" label="React" accent="emerald" position="left-[56%] top-[11%]" /><SkillNode id="backend" label="Backend" accent="cyan" position="left-[87%] top-[25%]" /><SkillNode id="ai" label="AI/ML" accent="amber" position="left-[88%] top-[67%]" /><SkillNode id="system" label="System Design" accent="amber" position="left-[65%] top-[86%]" />
      <div className="absolute inset-x-[12%] bottom-[2%] h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/35 to-transparent" />
    </div>
  )
}
