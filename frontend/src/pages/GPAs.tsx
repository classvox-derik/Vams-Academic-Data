import { useState, useMemo } from "react"
import { useData } from "@/data/useData"
import { Tabs } from "@/components/ui/Tabs"
import { SummaryCards } from "@/components/ui/SummaryCards"
import { DataTable } from "@/components/ui/DataTable"

const tabs = [
  { key: "s1", label: "Semester 1" },
  { key: "q1", label: "Quarter 1" },
  { key: "core", label: "Core GPA (3.3)" },
]

interface SheetConfig {
  name: string
  gpaKey: string
  gradeKey: string
  cols: string[]
}

const configs: Record<string, SheetConfig> = {
  s1: { name: "S1 GPAs", gpaKey: "S1", gradeKey: "Grd", cols: ["Stu ID", "Student Name", "Grd", "HR", "GPA PP1", "S1", "Difference"] },
  q1: { name: "Q1 GPAs", gpaKey: "GPA PP1", gradeKey: "Grd", cols: ["Stu ID", "Student Name", "Grd", "GPA PP1"] },
  core: { name: "3.3 GPA", gpaKey: "Core GPA", gradeKey: "Grade", cols: ["Student ID", "Student Name", "Grade", "Homeroom", "Language Fluency", "SPED", "Science", "Math", "ELA", "History", "Core GPA"] },
}

export function GPAs() {
  const { data, loading } = useData()
  const [tab, setTab] = useState("s1")
  const [grade, setGrade] = useState("")
  const [range, setRange] = useState("")

  const config = configs[tab]
  const sheet = data[config.name]

  const filtered = useMemo(() => {
    if (!sheet) return []
    let rows = sheet.rows
    if (grade) rows = rows.filter(r => r[config.gradeKey] === grade)
    if (range) {
      rows = rows.filter(r => {
        const g = parseFloat(r[config.gpaKey])
        if (isNaN(g)) return false
        if (range === "high") return g >= 3.5
        if (range === "mid") return g >= 2.5 && g < 3.5
        if (range === "low") return g < 2.5
        return true
      })
    }
    return rows
  }, [sheet, grade, range, config])

  const summary = useMemo(() => {
    if (!sheet) return []
    const gpas = sheet.rows.map(r => parseFloat(r[config.gpaKey])).filter(g => !isNaN(g))
    const avg = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0
    const above35 = gpas.filter(g => g >= 3.5).length
    const above30 = gpas.filter(g => g >= 3.0).length
    const below25 = gpas.filter(g => g < 2.5).length
    const total = gpas.length
    return [
      { label: `Average GPA: ${avg.toFixed(2)}`, value: total, total: 0, color: "navy" as const },
      { label: "3.5+ GPA", value: above35, total, color: "teal" as const },
      { label: "3.0+ GPA", value: above30, total, color: "gold" as const },
      { label: "Below 2.5", value: below25, total, color: "coral" as const },
    ]
  }, [sheet, config])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!sheet) return <div className="py-20 text-center text-muted">No data available.</div>

  const displayCols = config.cols.filter(c => sheet.headers.includes(c))

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">GPA Tracking</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">Quarter 1 and Semester 1 GPA data with growth tracking</p>
      </div>

      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <Tabs tabs={tabs} active={tab} onChange={t => { setTab(t); setGrade(""); setRange("") }} />
        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Grades</option>
          {["5", "6", "7", "8"].map(g => <option key={g} value={g}>{g}th</option>)}
        </select>
        <select value={range} onChange={e => setRange(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All GPAs</option>
          <option value="high">3.5+ (High)</option>
          <option value="mid">2.5 - 3.49</option>
          <option value="low">Below 2.5</option>
        </select>
      </div>

      <SummaryCards items={summary} />
      <DataTable headers={displayCols} rows={filtered} />
    </div>
  )
}
