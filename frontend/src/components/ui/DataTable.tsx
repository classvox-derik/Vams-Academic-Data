import { useState, useMemo } from "react"
import { cn, badgeClass, placementClass, gpaClass, formatName, isNameHeader } from "@/lib/utils"

interface ActionColumn {
  label: string
  icon?: React.ReactNode
  onClick: (row: Record<string, string>) => void
}

interface DataTableProps {
  headers: string[]
  rows: Record<string, string>[]
  maxHeight?: string
  onRowClick?: (row: Record<string, string>) => void
  actionColumn?: ActionColumn
}

function formatCell(header: string, val: string): { text: string; className: string; isBadge: boolean } {
  const h = header.toLowerCase()
  // Standard badges
  const badgeValues = ["Standards Exceeded", "Standards Met", "Standards Nearly Met", "Standards Not Met", "Above Standard", "Near Standard", "Below Standard"]
  if (badgeValues.includes(val)) {
    return { text: val, className: badgeClass(val), isBadge: true }
  }
  // Placement colors
  if (h.includes("placement") || h.includes("relative")) {
    const cls = placementClass(val)
    if (cls) return { text: val, className: cls, isBadge: false }
  }
  // GPA
  if (h.includes("gpa") || h === "s1" || h === "core gpa") {
    const g = parseFloat(val)
    if (!isNaN(g)) return { text: g.toFixed(2), className: gpaClass(g), isBadge: false }
  }
  // Difference
  if (h === "difference") {
    const d = parseFloat(val)
    if (!isNaN(d)) {
      const cls = d > 0 ? "text-teal font-semibold" : d < 0 ? "text-coral font-semibold" : ""
      return { text: d > 0 ? `+${d.toFixed(2)}` : d.toFixed(2), className: cls, isBadge: false }
    }
  }
  // Name formatting
  if (isNameHeader(header)) {
    return { text: formatName(val), className: "", isBadge: false }
  }
  return { text: val, className: "", isBadge: false }
}

const columnLabels: Record<string, string> = { "SPED": "IEP" }
function colLabel(h: string): string {
  if (columnLabels[h]) return columnLabels[h]
  let l = h
  l = l.replace(/^(24-25|25-26)\s+/, "")
  l = l.replace("Scale Score", "Score")
  l = l.replace("Overall Placement", "Placement")
  l = l.replace(/\(D2-D1\)/, "")
  l = l.replace(/Prev\.?\s*Yr\.?\s*/i, "")
  l = l.replace(/Pref\.?\s*Year\s*/i, "")
  l = l.replace(/Level\s+/i, "")
  l = l.replace(/Same\s*\/?\s*Improved/i, "Same/Imp.")
  return l.trim()
}

export function DataTable({ headers, rows, maxHeight = "70vh", onRowClick, actionColumn }: DataTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = useMemo(() => {
    if (!sortCol) return rows
    return [...rows].sort((a, b) => {
      const va = a[sortCol] ?? ""
      const vb = b[sortCol] ?? ""
      const na = parseFloat(va)
      const nb = parseFloat(vb)
      if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }, [rows, sortCol, sortAsc])

  function toggleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(true) }
  }

  return (
    <div className="overflow-auto rounded-lg bg-card shadow-sm -mx-3 sm:mx-0 overscroll-contain" style={{ maxHeight, WebkitOverflowScrolling: "touch" }}>
      <table className="min-w-full sm:min-w-0 sm:w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            {actionColumn && (
              <th className="bg-navy px-2 py-2 sm:px-3.5 sm:py-2.5 text-center text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-wide text-white first:rounded-tl-lg">
                {actionColumn.label}
              </th>
            )}
            {headers.map(h => (
              <th
                key={h}
                onClick={() => toggleSort(h)}
                className={cn(
                  "cursor-pointer select-none whitespace-nowrap sm:whitespace-normal bg-navy px-2 py-2 sm:px-3.5 sm:py-2.5 text-left text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-wide text-white hover:bg-navy-light last:rounded-tr-lg",
                  !actionColumn && "first:rounded-tl-lg"
                )}
              >
                {(() => { const label = colLabel(h); return label.length > 35 ? label.slice(0, 35) + "..." : label })()}
                {sortCol === h && <span className="ml-1 text-teal-light">{sortAsc ? "▲" : "▼"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors hover:bg-teal/5",
                onRowClick && "cursor-pointer",
                i % 2 === 0 ? "bg-card" : "bg-stripe"
              )}
            >
              {actionColumn && (
                <td className="border-b border-border-light px-2 py-1.5 sm:px-3.5 sm:py-2 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); actionColumn.onClick(row) }}
                    className="rounded-md bg-teal px-2.5 py-1 sm:px-3 sm:py-1.5 text-[0.65rem] sm:text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal/85 active:bg-teal/70"
                  >
                    Analyze
                  </button>
                </td>
              )}
              {headers.map(h => {
                const { text, className, isBadge } = formatCell(h, row[h] ?? "")
                return (
                  <td key={h} className="max-w-[250px] border-b border-border-light px-2 py-2 sm:px-3.5 sm:py-2.5 whitespace-nowrap sm:whitespace-normal sm:max-w-none">
                    {isBadge ? (
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>{text}</span>
                    ) : (
                      <span className={className}>{text}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={headers.length + (actionColumn ? 1 : 0)} className="px-4 py-12 text-center text-muted">No data found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
