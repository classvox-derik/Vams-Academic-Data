import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { CoolIcon } from "@/components/ui/CoolIcon"
import { useAuth } from "@/data/useAuth"

type Severity = "low" | "medium" | "high" | "critical" | ""
type Category = "data" | "ui" | "performance" | "login" | "other" | ""

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
  severity: "",
  category: "",
}

const severityOptions: { value: Exclude<Severity, "">; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
]

const categoryOptions: { value: Exclude<Category, "">; label: string }[] = [
  { value: "data", label: "Data / Reports" },
  { value: "ui", label: "User Interface" },
  { value: "performance", label: "Performance" },
  { value: "login", label: "Login / Access" },
  { value: "other", label: "Other" },
]

const RECIPIENT = "dvandiest@brightstarschools.org"

function buildEmailBody(form: BugForm, email: string | undefined) {
  const lines: string[] = []

  if (form.title) lines.push(`Title: ${form.title}`)
  if (form.category) {
    const cat = categoryOptions.find((o) => o.value === form.category)
    lines.push(`Category: ${cat?.label ?? form.category}`)
  }
  if (form.severity) {
    lines.push(`Severity: ${form.severity.charAt(0).toUpperCase() + form.severity.slice(1)}`)
  }
  if (form.description) {
    lines.push("", "Description:", form.description)
  }
  if (form.steps) {
    lines.push("", "Steps to Reproduce:", form.steps)
  }
  if (form.expected) {
    lines.push("", "Expected Behavior:", form.expected)
  }
  if (email) {
    lines.push("", `Reported by: ${email}`)
  }

  return lines.join("\n")
}

export function BugReport() {
  const { user } = useAuth()
  const [form, setForm] = useState<BugForm>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof BugForm>(key: K, value: BugForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const subject = form.title
      ? `[VAMS Bug] ${form.title}`
      : "[VAMS Bug Report]"
    const body = buildEmailBody(form, user?.email)

    window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setSubmitted(true)
    setForm(initialForm)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <CoolIcon name="check" size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-heading font-heading">Bug Report Ready</h2>
        <p className="mt-2 text-sm text-secondary">
          Your email client should have opened with the report. Send the email to complete your submission.
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
          Found something that isn&rsquo;t working right? Let us know so we can fix it. All fields are optional.
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
                Title
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
                  <option value="">Select a category...</option>
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
                      onClick={() => update("severity", form.severity === opt.value ? "" : opt.value)}
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
                Description
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy/90 sm:w-auto"
            >
              Submit Bug Report
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
