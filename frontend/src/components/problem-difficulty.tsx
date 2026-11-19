import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import type { Difficulty } from "@/data/problems"

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Hard: "border-rose-500/20 bg-rose-500/10 text-rose-400",
}

export function ProblemDifficulty({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge variant="outline" className={cn("font-medium", difficultyStyles[difficulty])}>
      {difficulty}
    </Badge>
  )
}
