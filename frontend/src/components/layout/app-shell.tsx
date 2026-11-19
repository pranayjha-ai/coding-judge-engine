
import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Code2, LogOut, Menu, Search, X } from "lucide-react"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
function handleSignOut() {
  localStorage.removeItem("token")
  navigate("/login", { replace: true })
}
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-5 lg:flex">
        <NavLink to="/problems" className="mb-10">
          <Brand />
        </NavLink>

        <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
          Menu
        </p>

        <NavLink
          to="/problems"
          className={({ isActive }) =>
            cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm hover:bg-accent",
              isActive && "bg-accent text-foreground",
            )
          }
        >
          <Code2 className="size-4" />
          Problems
        </NavLink>

        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              className="pl-9"
            />
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            Coding Judge
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-b border-border p-4 lg:hidden">
            <Brand />
            <NavLink
              to="/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 flex items-center gap-2 text-sm"
            >
              <Code2 className="size-4" />
              Problems
            </NavLink>
            <Button
              variant="ghost"
              className="mt-3 w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 size-4" />
              Sign Out
            </Button>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
