import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/data/useAuth"
import { cn } from "@/lib/utils"

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem("darkMode")
  if (stored !== null) return stored === "true"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function friendlyError(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Invalid email or password."
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try signing in."
  }
  if (msg.includes("password") && msg.includes("least")) {
    return "Password must be at least 6 characters."
  }
  if (msg.includes("valid email") || msg.includes("invalid email")) {
    return "Please enter a valid email address."
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again."
  }
  return message
}

export function Login() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Apply dark mode on login page
  useEffect(() => {
    document.documentElement.classList.toggle("dark", getInitialDarkMode())
  }, [])

  // Redirect if already signed in
  useEffect(() => {
    if (user) navigate("/", { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }
    }

    setSubmitting(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        setSuccess("Account created! Check your email to confirm your account, then sign in.")
        setIsSignUp(false)
        setPassword("")
        setConfirmPassword("")
      } else {
        await signIn(email, password)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(friendlyError(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Logo & heading */}
        <div className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="Valor Academy Middle School"
            className="mx-auto h-auto w-32 mb-4"
          />
          <h1 className="text-xl font-bold text-heading font-heading">
            VAMS Academic Data Tracker
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Sign in to access student data and analytics
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Tabs */}
          <div className="mb-5 flex rounded-lg bg-tab p-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(""); setSuccess("") }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-all",
                !isSignUp
                  ? "bg-card text-heading shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); setSuccess("") }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-all",
                isSignUp
                  ? "bg-card text-heading shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-coral/30 bg-coral/5 p-3">
              <p className="text-sm text-coral">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 rounded-lg border border-teal/30 bg-teal/5 p-3">
              <p className="text-sm text-teal">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@brightstarschools.org"
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-heading placeholder:text-muted transition-all focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-heading placeholder:text-muted transition-all focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-secondary">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-heading placeholder:text-muted transition-all focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? (isSignUp ? "Creating Account..." : "Signing In...")
                : (isSignUp ? "Create Account" : "Sign In")
              }
            </button>
          </form>

          {isSignUp && (
            <p className="mt-4 text-center text-xs text-muted">
              Only <span className="font-medium text-secondary">@brightstarschools.org</span> emails can create accounts.
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Valor Academy Middle School &middot; Bright Star Schools
        </p>
      </div>
    </div>
  )
}
