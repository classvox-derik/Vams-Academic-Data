import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { CoolIcon } from "@/components/ui/CoolIcon"
import { useAuth } from "@/data/useAuth"
import { supabase } from "@/lib/supabase"

type Severity = "low" | "medium" | "high" | "critical"
type Category = "data" | "ui" | "performance" | "login" | "other"

interface BugForm {
  title: string
  description: string
  steps: string
  expected: string
  severity: Severity
  category: Category
}

const initialForm: BugForm = {
  title: "",
  description: "",
  steps: "",
  expected: "",
  severity: "medium",
  category: "other",
}

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
]

const categoryOptions: { value: Category; label: string }[] = [
  { value: "data", label: "Data / Reports" },
  { value: "ui", label: "User Interface" },
  { value: "performance", label: "Performance" },
  { value: "login", label: "Login / Access" },
  { value: "other", label: "Other" },
]

export function BugReport() {
  const { user } = useAuth()
  const [form, setForm] = useState<BugForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  function update<K extends keyof BugForm>(key: K, value: BugForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.")
      return
    }

    setSubmitting(true)
    try {
      const { error: dbError } = await supabase.from("bug_reports").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        steps_to_reproduce: form.steps.trim() || null,
        expected_behavior: form.expected.trim() || null,
        severity: form.severity,
        category: form.category,
        reporter_email: user?.email ?? null,
      })

      if (dbError) throw dbError

      setSubmitted(true)
      setForm(initialForm)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit bug report."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <CoolIcon name="check" size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-heading font-heading">Bug Report Submitted</h2>
        <p className="mt-2 text-sm text-secondary">
          Thank you for helping improve VAMS. We&rsquo;ll look into this as soon as possible.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-md bg-navy px-5 py-2 text-sm font-medium text-white transition hover:bg-navy/90"
        >
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">
          <CoolIcon name="bug" size={22} className="mr-2 inline-block align-text-bottom text-coral" />
          Report a Bug
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">
          Found something that isn&rsquo;t working right? Let us know so we can fix it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bug Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="bug-title" className="mb-1 block text-xs font-medium text-heading">
                Title <span className="text-coral">*</span>
              </label>
              <input
                id="bug-title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted/50 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Category & Severity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bug-category" className="mb-1 block text-xs font-medium text-heading">
                  Category
                </label>
                <select
                  id="bug-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value as Category)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-heading">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("severity", opt.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        form.severity === opt.value
                          ? opt.color + " ring-2 ring-navy/30"
                          : "bg-surface text-muted hover:bg-surface/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="bug-description" className="mb-1 block text-xs font-medium text-heading">
                Description <span className="text-coral">*</span>
              </label>
              <textarea
                id="bug-description"
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What went wrong? Please be as specific as possible."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted/50 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label htmlFor="bug-steps" className="mb-1 block text-xs font-medium text-heading">
                Steps to Reproduce
              </label>
              <textarea
                id="bug-steps"
                rows={3}
                value={form.steps}
                onChange={(e) => update("steps", e.target.value)}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted/50 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Expected Behavior */}
            <div>
              <label htmlFor="bug-expected" className="mb-1 block text-xs font-medium text-heading">
                Expected Behavior
              </label>
              <textarea
                id="bug-expected"
                rows={2}
                value={form.expected}
                onChange={(e) => update("expected", e.target.value)}
                placeholder="What did you expect to happen instead?"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted/50 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Reporter info */}
            {user?.email && (
              <p className="text-xs text-muted">
                Submitting as <span className="font-medium text-secondary">{user.email}</span>
              </p>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy/90 disabled:opacity-50 sm:w-auto"
            >
              {submitting ? "Submitting..." : "Submit Bug Report"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
