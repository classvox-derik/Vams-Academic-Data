import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useData } from "@/data/useData"
import { DataTable } from "@/components/ui/DataTable"
import { Tabs } from "@/components/ui/Tabs"
import { KpiCard } from "@/components/ui/KpiCard"
import { ordinal } from "@/lib/utils"
import { CoolIcon } from "@/components/ui/CoolIcon"

const categoryTabs = [
  { key: "overview", label: "Overview" },
  { key: "reading", label: "iReady Reading" },
  { key: "math", label: "iReady Math" },
  { key: "assessments", label: "Assessments" },
  { key: "academics", label: "Academics" },
]

function matchesCategory(h: string, category: string): boolean {
  const hl = h.toLowerCase()
  const isStudent = hl === "student"
  switch (category) {
    case "overview":
      return isStudent || hl === "grade" || hl === "hr" || hl.includes("growth") || hl.includes("gpa")
    case "reading":
      return isStudent || hl.includes("reading") || hl.includes("rdg")
    case "math":
      return isStudent || ((hl.includes("math") || hl.includes("d1 math") || hl.includes("d2 math") || hl.includes("d3 math")) && !hl.includes("caaspp") && !hl.includes("iab"))
    case "assessments":
      return isStudent || hl.includes("caaspp") || hl.includes("iab") || hl.includes("cast")
    case "academics":
      return isStudent || hl === "ie" || hl === "el" || hl === "mll" || hl === "eld" || hl.includes("gpa") || hl === "interventions"
    default:
      return true
  }
}

export function GradeView() {
  const { grade } = useParams<{ grade: string }>()
  const { data, loading } = useData()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const sheetName = `${ordinal(Number(grade))} Grade`
  const gradeData = data[sheetName]

  const stats = useMemo(() => {
    if (!gradeData) return { total: 0, avgReadingGrowth: "N/A", avgMathGrowth: "N/A" }
    const rows = gradeData.rows
    let rg = 0, mg = 0, count = 0
    rows.forEach(r => {
      const rv = parseFloat(r["Reading Growth (D2-D1)"])
      const mv = parseFloat(r["Math Growth (D2-D1)"])
      if (!isNaN(rv)) { rg += rv; count++ }
      if (!isNaN(mv)) mg += mv
    })
    return {
      total: rows.length,
      avgReadingGrowth: count > 0 ? (rg / count).toFixed(0) : "N/A",
      avgMathGrowth: count > 0 ? (mg / count).toFixed(0) : "N/A",
    }
  }, [gradeData])

  const filtered = useMemo(() => {
    if (!gradeData) return []
    if (!search) return gradeData.rows
    const q = search.toLowerCase()
    return gradeData.rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
  }, [gradeData, search])

  const allHeaders = useMemo(() => {
    if (!gradeData) return []
    return gradeData.headers.filter(h => h && h.length > 0 && h.length < 60)
  }, [gradeData])

  const visibleHeaders = useMemo(() => {
    return allHeaders.filter(h => matchesCategory(h, activeTab))
  }, [allHeaders, activeTab])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>
  if (!gradeData) return <div className="py-20 text-center text-muted">No data for this grade.</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">{ordinal(Number(grade))} Grade Overview</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">{stats.total} students — iReady, CAASPP, IAB, and GPA data</p>
      </div>

      <div className="mb-4 sm:mb-6 grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <KpiCard icon={<CoolIcon name="Users" size={20} />} value={stats.total} label="Total Students" color="navy" />
        <KpiCard icon={<CoolIcon name="Trending_Up" size={20} />} value={stats.avgReadingGrowth} label="Avg Reading Growth (D2-D1)" color="teal" />
        <KpiCard icon={<CoolIcon name="Trending_Up" size={20} />} value={stats.avgMathGrowth} label="Avg Math Growth (D2-D1)" color="gold" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={`Search ${ordinal(Number(grade))} grade students...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-auto sm:min-w-[250px] rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <Tabs tabs={categoryTabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <DataTable headers={visibleHeaders} rows={filtered} />
    </div>
  )
}
