import { CodeXml } from "lucide-react"

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CodeXml className="size-[18px]" />
      </span>
      {!compact && (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Codebench
        </span>
      )}
    </span>
  )
}
