import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "reading", label: "Reading" },
  { key: "math", label: "Math" },
]

const sheetMap: Record<string, Record<string, string>> = {
  reading: { "5": "5th D2 Reading", "6": "6th D2 Reading", "7": "7th D2 Reading", "8": "8th D2 Reading" },
  math: { "5": "5th D2 Math", "6": "6th D2 Math", "7": "7th D2 Math", "8": "8th D2 Math" },
}

export function IReady() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("reading")
  const [grade, setGrade] = useState("")
  const [placement, setPlacement] = useState("")

  const { rows, headers } = useMemo(() => {
    const sheets = sheetMap[tab]
    let allRows: (Record<string, string>)[] = []
    let hdrs: string[] = []
    Object.entries(sheets).forEach(([g, name]) => {
      const sheet = data[name]
      if (!sheet) return
      if (hdrs.length === 0) hdrs = sheet.headers
      sheet.rows.forEach(r => allRows.push({ ...r, Grade: g }))
    })
    return { rows: allRows, headers: hdrs }
  }, [data, tab])

  const filtered = useMemo(() => {
    let r = rows
    if (grade) r = r.filter(row => row.Grade === grade)
    if (placement) r = r.filter(row => (row["5-Level Overall Relative Placement"] || "").includes(placement))
    return r
  }, [rows, grade, placement])

  const placements = useMemo(() => {
    const levels = ["Mid or Above Grade Level", "Early On Grade Level", "One Grade Level Below", "Two Grade Levels Below", "Three or More Grade Levels Below"]
    const colors: ("teal" | "gold" | "orange" | "coral")[] = ["teal", "gold", "orange", "coral", "coral"]
    return levels.map((l, i) => ({
      label: l,
      value: filtered.filter(r => (r["5-Level Overall Relative Placement"] || "") === l).length,
      total: filtered.length,
      color: colors[i],
    }))
  }, [filtered])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>

  const displayCols = ["Grade", "Student", "Scale Score", "Overall Placement", "5-Level Overall Relative Placement", "Percentile Rank"]
    .filter(c => c === "Grade" || headers.includes(c))

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">iReady Diagnostic Results</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">Reading and Math diagnostic assessments across all grade levels</p>
      </div>

      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Grades</option>
          {["5", "6", "7", "8"].map(g => <option key={g} value={g}>{g}th</option>)}
        </select>
        <select value={placement} onChange={e => setPlacement(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Placements</option>
          <option value="Mid or Above Grade Level">Mid or Above Grade Level</option>
          <option value="Early On Grade Level">Early On Grade Level</option>
          <option value="One Grade Level Below">One Grade Level Below</option>
          <option value="Two Grade Levels Below">Two Grade Levels Below</option>
          <option value="Three or More Grade Levels Below">3+ Grade Levels Below</option>
        </select>
      </div>

      <SummaryCards items={placements} />
      <DataTable headers={displayCols} rows={filtered} />
    </div>
  )
}
