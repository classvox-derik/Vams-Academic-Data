import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useData } from "@/data/useData"
import { useAnalysis } from "@/data/useAnalysis"
import { aggregateStudentData } from "@/lib/studentDataAggregator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { KpiCard } from "@/components/ui/KpiCard"
import { CoolIcon } from "@/components/ui/CoolIcon"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { cn, formatName } from "@/lib/utils"
import { useLibrary } from "@/data/useLibrary"

function cleanAnalysis(text: string): string {
  // Strip generic intro lines like "Here's an analysis of [name]'s academic data..."
  const lines = text.split("\n")
  const cleaned: string[] = []
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (cleaned.length === 0 && (
      lower.includes("here's an analysis") ||
      lower.includes("here is an analysis") ||
      lower.includes("here's a comprehensive") ||
      lower.includes("here is a comprehensive") ||
      lower.includes("let me analyze") ||
      lower.includes("i'll analyze") ||
      lower.includes("based on the provided data") ||
      lower.includes("based on the data provided")
    )) continue
    // Skip blank lines at the very start
    if (cleaned.length === 0 && !line.trim()) continue
    cleaned.push(line)
  }
  return cleaned.join("\n")
}

export function StudentAnalysis() {
  const { studentId } = useParams<{ studentId: string }>()
  const { data, loading: dataLoading } = useData()
  const { result, loading: analyzing, error, analyze, retry } = useAnalysis()
  const { saveAnalysis, saving } = useLibrary()
  const [saved, setSaved] = useState(false)

  const profile = useMemo(() => {
    if (dataLoading || !studentId) return null
    return aggregateStudentData(data, studentId)
  }, [data, dataLoading, studentId])

  // Extract S1 GPA from profile if available
  const s1Gpa = useMemo(() => {
    if (!profile) return "N/A"
    const s1 = profile.sections.find(s => s.sheetName === "S1 GPAs")
    if (!s1 || !s1.rows.length) return "N/A"
    const gpaVal = s1.rows[0]["S1"] ?? s1.rows[0]["GPA"] ?? ""
    const parsed = parseFloat(gpaVal)
    return isNaN(parsed) ? "N/A" : parsed.toFixed(2)
  }, [profile])

  if (dataLoading) {
    return <div className="py-20 text-center text-muted">Loading student data...</div>
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted">Student not found</p>
        <Link to="/students" className="mt-4 inline-block text-teal hover:underline">
          Back to Students
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link to="/students" className="mb-2 inline-flex items-center gap-1 text-sm text-teal hover:underline">
          <CoolIcon name="Arrow_Left_MD" size={14} /> Back to Students
        </Link>
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">
          Student Analysis: {formatName(profile.studentName)}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">
          Grade {profile.gradeLevel} &middot; {profile.homeroom} &middot; ID: {profile.studentId}
        </p>
      </div>

      {/* KPI cards */}
      <div className="mb-4 sm:mb-6 grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard
          icon={<CoolIcon name="Chat_Circle" size={20} />}
          value={profile.demographics.languageFluency || "N/A"}
          label="Language Status"
          color="navy"
        />
        <KpiCard
          icon={<CoolIcon name="Heart_01" size={20} />}
          value={profile.demographics.sped === "Y" ? "Yes" : "No"}
          label="IEP Status"
          color={profile.demographics.sped === "Y" ? "orange" : "teal"}
        />
        <KpiCard
          icon={<CoolIcon name="Star" size={20} />}
          value={s1Gpa}
          label="S1 GPA"
          color="gold"
        />
        <KpiCard
          icon={<CoolIcon name="Data" size={20} />}
          value={profile.sections.length}
          label="Data Sources Found"
          color="teal"
        />
      </div>

      {/* Available data badges */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader><CardTitle>Available Data</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.sections.map(s => (
              <span
                key={s.sheetName}
                className="inline-block rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal whitespace-nowrap"
              >
                {s.label} ({s.rows.length})
              </span>
            ))}
            {profile.sections.length === 0 && (
              <p className="text-sm text-muted">No assessment data found for this student.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {!result && (
        <Card>
          <CardContent className="pt-4 sm:pt-5">
            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-coral/30 bg-coral/5 p-4">
                <p className="text-sm font-medium text-coral">{error.message}</p>
                {error.code === "API_KEY_MISSING" && (
                  <p className="mt-1 text-xs text-muted">
                    Set OPENROUTER_API_KEY in the .env file at the project root.
                  </p>
                )}
                {error.code === "QUOTA_EXCEEDED" && (
                  <p className="mt-1 text-xs text-muted">
                    Your OpenRouter rate limit has been reached. Wait a bit and retry, or check your plan at openrouter.ai.
                  </p>
                )}
                <button onClick={retry} className="mt-2 text-sm text-teal hover:underline">
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!analyzing && !error && (
              <div className="flex flex-col items-center py-8 gap-3">
                <p className="text-sm text-muted">
                  Click below to generate an AI-powered analysis of this student&apos;s academic data.
                </p>
                <button
                  onClick={() => analyze(profile)}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-teal hover:bg-teal/90 transition-colors shadow-sm"
                >
                  Analyze Student
                </button>
              </div>
            )}

            {/* Loading state */}
            {analyzing && (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal border-t-transparent" />
                <p className="text-sm text-secondary">
                  Analyzing {formatName(profile.studentName)}&apos;s data across {profile.sections.length} sources...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardContent className="pt-4 sm:pt-5">
            <MarkdownRenderer content={cleanAnalysis(result.analysis)} />
            <div className="mt-5 pt-3 border-t border-border-light flex items-center justify-between">
              <span className="text-xs text-muted">
                Tokens: {result.usage.input_tokens} in / {result.usage.output_tokens} out
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await saveAnalysis({
                      student_name: profile.studentName,
                      student_id: profile.studentId,
                      grade_level: profile.gradeLevel,
                      analysis_text: result.analysis,
                    })
                    setSaved(true)
                  }}
                  disabled={saving || saved}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    saved
                      ? "bg-teal/10 text-teal cursor-default"
                      : "bg-navy text-white hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {saving ? "Saving..." : saved ? "Saved" : "Save to Library"}
                </button>
                <button
                  onClick={() => { analyze(profile); setSaved(false) }}
                  disabled={analyzing}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors",
                    "bg-teal hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Re-analyze
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
