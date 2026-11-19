import type { ReactNode } from "react"

type AuthCardProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <section className="w-full max-w-[420px] rounded-xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-7">{children}</div>
      <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
        {footer}
      </div>
    </section>
  )
}
