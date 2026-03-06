import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "ela1", label: "ELA Round 1" },
  { key: "ela2", label: "ELA Round 2" },
  { key: "math1", label: "Math Round 1" },
  { key: "math2", label: "Math Round 2" },
]

const sheetMap: Record<string, string> = {
  ela1: "IAB ELA Results",
  ela2: "IAB2 ELA Results",
  math1: "IAB Math Results",
  math2: "IAB2 Math Results",
}

export function IAB() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("ela1")
  const [category, setCategory] = useState("")

  const sheet = data[sheetMap[tab]]

  const filtered = useMemo(() => {
    if (!sheet) return []
    if (!category) return sheet.rows
    return sheet.rows.filter(r => (r["Reporting Category"] || "") === category)
  }, [sheet, category])

  const summary = useMemo(() => {
    if (!sheet) return []
    const cats = ["Above Standard", "Near Standard", "Below Standard"]
    const colors: ("teal" | "gold" | "coral")[] = ["teal", "gold", "coral"]
    const total = sheet.rows.length
    return cats.map((c, i) => ({
      label: c,
      value: sheet.rows.filter(r => (r["Reporting Category"] || "") === c).length,
      total,
      color: colors[i],
    }))
  }, [sheet])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!sheet) return <div className="py-20 text-center text-muted">No data available.</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">IAB Results</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">Interim Assessment Block results for ELA and Math</p>
      </div>

      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Categories</option>
          <option value="Above Standard">Above Standard</option>
          <option value="Near Standard">Near Standard</option>
          <option value="Below Standard">Below Standard</option>
        </select>
      </div>

      <SummaryCards items={summary} />
      <DataTable headers={sheet.headers.filter(h => h.length > 0)} rows={filtered} />
    </div>
  )
}
