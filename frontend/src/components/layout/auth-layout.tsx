import { Link, Outlet } from "react-router-dom"
import { Brand } from "@/components/brand"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Brand />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Outlet />
      </main>
      <footer className="space-y-2 px-5 py-5 text-center text-xs text-muted-foreground">
        <p>Built for focused problem solving.</p>
        <Link to="/problems" className="underline-offset-4 hover:text-foreground hover:underline">
          Explore the demo
        </Link>
      </footer>
    </div>
  )
}
