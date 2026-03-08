import { useState } from "react"
import { Link } from "react-router-dom"
import { useLibrary } from "@/data/useLibrary"
import type { SavedAnalysis } from "@/data/useLibrary"
import { Card, CardContent } from "@/components/ui/Card"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { CoolIcon } from "@/components/ui/CoolIcon"
import { formatName } from "@/lib/utils"

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function AnalysisCard({
  analysis,
  expanded,
  onToggle,
  onDelete,
}: {
  analysis: SavedAnalysis
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-5">
        {/* Header row */}
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-heading truncate">
              {formatName(analysis.student_name)}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Grade {analysis.grade_level} &middot; {formatDate(analysis.saved_at)} &middot; {analysis.model}
            </p>
          </div>
          <CoolIcon
            name={expanded ? "Chevron_Up" : "Chevron_Down"}
            size={16}
            className="shrink-0 text-muted"
          />
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-border-light">
            <MarkdownRenderer content={analysis.analysis_text} />

            <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
              <Link
                to={`/students/${analysis.student_id}/analysis`}
                className="text-xs text-teal hover:underline"
              >
                View Student Profile
              </Link>

              {!confirmDelete ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                  className="text-xs text-coral hover:underline"
                >
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Delete this analysis?</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                    className="rounded px-2 py-1 text-xs font-medium text-white bg-coral hover:bg-coral/90 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                    className="rounded px-2 py-1 text-xs font-medium text-secondary bg-tab hover:bg-border transition-colors"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function Library() {
  const { analyses, loading, deleteAnalysis } = useLibrary()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal border-t-transparent" />
        <p className="text-sm text-muted">Loading saved analyses...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">
          Saved Analyses
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">
          {analyses.length} saved {analyses.length === 1 ? "analysis" : "analyses"}
        </p>
      </div>

      {analyses.length === 0 && (
        <Card>
          <CardContent className="pt-4 sm:pt-5">
            <div className="flex flex-col items-center py-8 gap-3">
              <CoolIcon name="Folder_Open" size={32} className="text-muted" />
              <p className="text-sm text-muted">No saved analyses yet.</p>
              <Link to="/students" className="text-sm text-teal hover:underline">
                Go to Students to generate an analysis
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {analyses.map(analysis => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            expanded={expandedId === analysis.id}
            onToggle={() =>
              setExpandedId(expandedId === analysis.id ? null : analysis.id)
            }
            onDelete={() => deleteAnalysis(analysis.id)}
          />
        ))}
      </div>
    </div>
  )
}
