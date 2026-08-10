"use client"

import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const availableSkills = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "FastAPI",
  "Django",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "Git",
  "System Design",
  "Data Structures",
  "Machine Learning",
  "TensorFlow",
  "REST APIs",
]

interface SkillSelectorProps {
  selected: string[]
  onChange: (skills: string[]) => void
}

export function SkillSelector({ selected, onChange }: SkillSelectorProps) {
  const [query, setQuery] = useState("")
  const filteredSkills = useMemo(
    () =>
      availableSkills.filter((skill) =>
        skill.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  )

  function toggleSkill(skill: string) {
    onChange(
      selected.includes(skill)
        ? selected.filter((item) => item !== skill)
        : [...selected, skill],
    )
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#71717A]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search skills"
          aria-label="Search skills"
          className="h-12 border-white/10 bg-[#111113] pl-10 pr-4 text-white placeholder:text-[#52525B]"
        />
      </div>

      {selected.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#A78BFA]">
              Selected skills
            </p>
            <span className="text-xs tabular-nums text-[#71717A]">{selected.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-1.5 text-xs font-medium text-[#D8CCFF] transition-colors hover:bg-[#8B5CF6]/20"
              >
                {skill}
                <X className="size-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 max-h-64 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-2">
          {filteredSkills.map((skill) => {
            const isSelected = selected.includes(skill)
            return (
              <button
                key={skill}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm transition-all",
                  isSelected
                    ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#6EE7B7]"
                    : "border-white/[0.08] bg-[#18181B] text-[#A1A1AA] hover:border-white/20 hover:text-white",
                )}
              >
                {isSelected && <CheckIcon />}
                {skill}
              </button>
            )
          })}
        </div>
        {filteredSkills.length === 0 && (
          <p className="py-8 text-center text-sm text-[#71717A]">
            No matching skills found.
          </p>
        )}
      </div>
    </div>
  )
}

function CheckIcon() {
  return <span className="mr-1.5 inline-block size-1.5 rounded-full bg-[#10B981] align-middle" />
}
