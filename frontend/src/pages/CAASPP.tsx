import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "ela", label: "ELA" },
  { key: "math", label: "Math" },
]

export function CAASPP() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("ela")
  const [level, setLevel] = useState("")

  const sheet = tab === "ela" ? data["24-25 CAASPP ELA"] : data["24-25 CAASPP Math"]

  const achievementKey = useMemo(() => {
    if (!sheet) return ""
    return sheet.headers.find(h => h.includes("Achievement")) ?? ""
  }, [sheet])

  const filtered = useMemo(() => {
    if (!sheet) return []
    if (!level) return sheet.rows
    return sheet.rows.filter(r => (r[achievementKey] || "") === level)
  }, [sheet, level, achievementKey])

  const levels = useMemo(() => {
    if (!sheet) return []
    const names = ["Standards Exceeded", "Standards Met", "Standards Nearly Met", "Standards Not Met"]
    const colors: ("teal" | "gold" | "orange" | "coral")[] = ["teal", "gold", "orange", "coral"]
    const total = sheet.rows.length
    return names.map((name, i) => ({
      label: name,
      value: sheet.rows.filter(r => (r[achievementKey] || "") === name).length,
      total,
      color: colors[i],
    }))
  }, [sheet, achievementKey])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!sheet) return <div className="py-20 text-center text-muted">No data available.</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">CAASPP Results</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">24-25 California Assessment of Student Performance and Progress</p>
      </div>

      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <select value={level} onChange={e => setLevel(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Levels</option>
          <option value="Standards Exceeded">Standards Exceeded</option>
          <option value="Standards Met">Standards Met</option>
          <option value="Standards Nearly Met">Standards Nearly Met</option>
          <option value="Standards Not Met">Standards Not Met</option>
        </select>
      </div>

      <SummaryCards items={levels} />
      <DataTable headers={sheet.headers.filter(h => h.length > 0)} rows={filtered} />
    </div>
  )
}
