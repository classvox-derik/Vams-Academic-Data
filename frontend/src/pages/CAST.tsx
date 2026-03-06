import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "ia", label: "Interim Assessments" },
  { key: "summative", label: "24-25 Summative" },
]

export function CAST() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("ia")
  const [category, setCategory] = useState("")

  const sheet = tab === "ia" ? data["CAST IA"] : data["24-25 CAST"]
  const catKey = tab === "ia" ? "Reporting Category" : "Achievement Levels"

  const filtered = useMemo(() => {
    if (!sheet) return []
    if (!category) return sheet.rows
    return sheet.rows.filter(r => (r[catKey] || "") === category)
  }, [sheet, category, catKey])

  const summary = useMemo(() => {
    if (!sheet) return []
    const cats: Record<string, number> = {}
    sheet.rows.forEach(r => {
      const val = r[catKey] || ""
      if (val) cats[val] = (cats[val] || 0) + 1
    })
    const colorMap: Record<string, "teal" | "gold" | "orange" | "coral" | "navy"> = {
      "Above Standard": "teal", "Near Standard": "gold", "Below Standard": "coral",
      "Standards Exceeded": "teal", "Standards Met": "gold", "Standards Nearly Met": "orange", "Standards Not Met": "coral",
    }
    const total = sheet.rows.length
    return Object.entries(cats).map(([label, value]) => ({
      label, value, total, color: colorMap[label] ?? "navy",
    }))
  }, [sheet, catKey])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!sheet) return <div className="py-20 text-center text-muted">No data available.</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">CAST Science Results</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">California Science Test interim and summative assessments</p>
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
