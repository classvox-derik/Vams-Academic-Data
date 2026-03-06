import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "below", label: "3+ Grade Levels Below" },
  { key: "concern", label: "Students of Concern" },
  { key: "writing", label: "Writing Group" },
  { key: "phonics", label: "Phonics Support" },
  { key: "duya", label: "Duya Cohort 2" },
]

const sheetMap: Record<string, string> = {
  below: "3+ Grade Levels Below",
  concern: "Students of Concern",
  writing: "Writing Group",
  phonics: "Phonics Support",
  duya: "Duya Cohort 2",
}

export function Interventions() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("below")

  const sheet = data[sheetMap[tab]]

  const summary = useMemo(() => {
    if (!sheet) return []
    const total = sheet.rows.length
    const byGrade: Record<string, number> = {}
    sheet.rows.forEach(r => {
      const g = r["Grade"] || r["Grd"] || ""
      if (g) byGrade[g] = (byGrade[g] || 0) + 1
    })
    const colors: ("navy" | "teal" | "gold" | "orange" | "coral")[] = ["navy", "teal", "gold", "orange", "coral"]
    return [
      { label: "Total Students", value: total, total: 0, color: "navy" as const },
      ...Object.entries(byGrade).map(([grade, count], i) => ({
        label: `Grade ${grade}`,
        value: count,
        total,
        color: colors[(i + 1) % colors.length],
      })),
    ]
  }, [sheet])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!sheet) return <div className="py-20 text-center text-muted">No data available.</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">Interventions & Support</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">At-risk students and intervention group tracking</p>
      </div>

      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <SummaryCards items={summary} />
      <DataTable headers={sheet.headers.filter(h => h.length > 0)} rows={sheet.rows} />
    </div>
  )
}
