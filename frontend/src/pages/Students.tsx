import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "@/data/useData"
import { DataTable } from "@/components/ui/DataTable"

export function Students() {
  const { data, loading } = useData()
  const navigate = useNavigate()
  const [grade, setGrade] = useState("")
  const [homeroom, setHomeroom] = useState("")
  const [language, setLanguage] = useState("")
  const [search, setSearch] = useState("")

  const master = data["Master Roster"]
  const displayCols = ["Student ID", "Student Name", "Gender", "Ethnicity", "Language Fluency", "SPED", "25-26 Grade Level", "25-26 Homeroom"]

  const homerooms = useMemo(() => {
    if (!master) return []
    return [...new Set(master.rows.map(r => r["25-26 Homeroom"]).filter(Boolean))].sort()
  }, [master])

  const languages = useMemo(() => {
    if (!master) return []
    return [...new Set(master.rows.map(r => r["Language Fluency"]).filter(Boolean))].sort()
  }, [master])

  const filtered = useMemo(() => {
    if (!master) return []
    return master.rows.filter(r => {
      if (grade && r["25-26 Grade Level"] !== grade) return false
      if (homeroom && r["25-26 Homeroom"] !== homeroom) return false
      if (language && r["Language Fluency"] !== language) return false
      if (search) {
        const q = search.toLowerCase()
        return Object.values(r).some(v => String(v).toLowerCase().includes(q))
      }
      return true
    })
  }, [master, grade, homeroom, language, search])

  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">Student Roster</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">Master student database with demographics and status</p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Grades</option>
          {["5", "6", "7", "8"].map(g => <option key={g} value={g}>{g}th Grade</option>)}
        </select>
        <select value={homeroom} onChange={e => setHomeroom(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Homerooms</option>
          {homerooms.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full sm:w-auto rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none">
          <option value="">All Language Status</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-auto sm:min-w-[200px] rounded-md border border-border bg-input px-3 py-1.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
        />
      </div>

      <DataTable
        headers={displayCols.filter(c => master?.headers.includes(c))}
        rows={filtered}
        actionColumn={{
          label: "",
          onClick: (row) => navigate(`/students/${row["Student ID"]}/analysis`),
        }}
      />
      <div className="mt-3 text-xs text-muted">
        Showing {filtered.length} of {master?.rows.length ?? 0} students
      </div>
    </div>
  )
}
