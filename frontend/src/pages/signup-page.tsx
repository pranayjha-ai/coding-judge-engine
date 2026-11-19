
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, LockKeyhole, Mail } from "lucide-react"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice("")

    if (password !== confirmPassword) {
      setNotice("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Account creation failed.")
      }

      // Store token if signup API returns one.
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      navigate(data.token ? "/problems" : "/login")
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      eyebrow="Get started"
      title="Create your account"
      description="Create an account to start solving problems."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium">
          Email
          <span className="relative block">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 pl-10"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium">
          Password
          <span className="relative block">
            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="h-10 pl-10"
              minLength={8}
              required
            />
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium">
          Confirm password
          <span className="relative block">
            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className="h-10 pl-10"
              required
            />
          </span>
        </label>

        {notice && (
          <p className="text-sm text-destructive" role="alert">
            {notice}
          </p>
        )}

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight data-icon="inline-end" />}
        </Button>
      </form>
    </AuthCard>
  )
}
