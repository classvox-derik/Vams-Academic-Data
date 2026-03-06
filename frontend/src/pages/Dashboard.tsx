import { useData } from "@/data/useData"
import { KpiCard } from "@/components/ui/KpiCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { HorizontalBarChart, StackedBarChart } from "@/components/ui/BarChart"
import { CoolIcon } from "@/components/ui/CoolIcon"

export function Dashboard() {
  const { data, loading } = useData()
  if (loading) return <div className="py-20 text-center text-muted">Loading...</div>

  const roster = data["Roster"]
  const master = data["Master Roster"]
  const s1 = data["S1 GPAs"]
  const below = data["3+ Grade Levels Below"]
  const caasppELA = data["24-25 CAASPP ELA"]
  const caasppMath = data["24-25 CAASPP Math"]

  const total = roster?.rows.length ?? 0
  const grades = [5, 6, 7, 8].map(g => ({
    grade: g,
    count: roster?.rows.filter(r => r["25-26 Grade Level"] === String(g)).length ?? 0,
  }))

  const gpas = s1?.rows.map(r => parseFloat(r["S1"] || r["GPA PP1"])).filter(g => !isNaN(g)) ?? []
  const avgGPA = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0

  const elCount = master?.rows.filter(r => r["Language Fluency"] === "EL").length ?? 0
  const spedCount = master?.rows.filter(r => r["SPED"] === "Y").length ?? 0
  const belowCount = below?.rows.length ?? 0

  function countLevels(rows: Record<string, string>[]) {
    const levels: Record<string, number> = { "Standards Exceeded": 0, "Standards Met": 0, "Standards Nearly Met": 0, "Standards Not Met": 0 }
    rows.forEach(r => {
      const val = r["Achievement Levels"] || ""
      if (val in levels) levels[val]++
    })
    return levels
  }

  const elaLevels = caasppELA ? countLevels(caasppELA.rows) : null
  const mathLevels = caasppMath ? countLevels(caasppMath.rows) : null

  const levelColors = [
    { name: "Standards Exceeded", color: "#2A9D8F" },
    { name: "Standards Met", color: "#E9C46A" },
    { name: "Standards Nearly Met", color: "#F4A261" },
    { name: "Standards Not Met", color: "#E76F51" },
  ]

  // GPA distribution
  const gpaRanges = [
    { label: "4.0", min: 4.0, max: 5, color: "#2A9D8F" },
    { label: "3.5-3.99", min: 3.5, max: 4.0, color: "#35b8a8" },
    { label: "3.0-3.49", min: 3.0, max: 3.5, color: "#E9C46A" },
    { label: "2.5-2.99", min: 2.5, max: 3.0, color: "#F4A261" },
    { label: "2.0-2.49", min: 2.0, max: 2.5, color: "#ed8e76" },
    { label: "Below 2.0", min: 0, max: 2.0, color: "#E76F51" },
  ]
  const gpaDist = gpaRanges.map(r => ({
    label: r.label,
    value: gpas.filter(g => g >= r.min && (r.max === 5 ? true : g < r.max)).length,
    color: r.color,
  }))

  const interventionGroups = [
    { label: "3+ GL Below", value: belowCount, color: "#E76F51" },
    { label: "Students of Concern", value: data["Students of Concern"]?.rows.length ?? 0, color: "#F4A261" },
    { label: "Writing Group", value: data["Writing Group"]?.rows.length ?? 0, color: "#E9C46A" },
    { label: "Phonics Support", value: data["Phonics Support"]?.rows.length ?? 0, color: "#2A9D8F" },
    { label: "Duya Cohort 2", value: data["Duya Cohort 2"]?.rows.length ?? 0, color: "#264653" },
  ]

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-heading font-heading">Dashboard Overview</h2>
        <p className="mt-1 text-xs sm:text-sm text-secondary">25-26 Academic Year at a Glance</p>
      </div>

      {/* KPIs */}
      <div className="mb-4 sm:mb-6 grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={<CoolIcon name="Users" size={20} />} value={total} label="Total Students" detail="Grades 5-8" color="navy" />
        <KpiCard icon={<CoolIcon name="Star" size={20} />} value={avgGPA.toFixed(2)} label="Avg S1 GPA" detail="All students" color="teal" />
        <KpiCard icon={<CoolIcon name="Globe" size={20} />} value={elCount} label="English Learners" detail={`${(elCount / total * 100).toFixed(0)}% of school`} color="gold" />
        <KpiCard icon={<CoolIcon name="User_Circle" size={20} />} value={spedCount} label="Students with IEP" detail={`${(spedCount / total * 100).toFixed(0)}% of school`} color="orange" />
        <KpiCard icon={<CoolIcon name="Triangle_Warning" size={20} />} value={belowCount} label="3+ Grade Levels Below" detail={`${(belowCount / total * 100).toFixed(0)}% of school`} color="coral" />
      </div>

      {/* Charts */}
      <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Students by Grade Level</CardTitle></CardHeader>
          <CardContent>
            <HorizontalBarChart items={grades.map((g, i) => ({
              label: `${["5th", "6th", "7th", "8th"][i]} Grade`,
              value: g.count,
              color: ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"][i],
            }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>CAASPP Performance Levels</CardTitle></CardHeader>
          <CardContent>
            {elaLevels && mathLevels && (
              <StackedBarChart
                items={[
                  { label: "ELA", segments: levelColors.map(l => ({ name: l.name, value: elaLevels[l.name], color: l.color })) },
                  { label: "Math", segments: levelColors.map(l => ({ name: l.name, value: mathLevels[l.name], color: l.color })) },
                ]}
                legend={levelColors}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>GPA Distribution</CardTitle></CardHeader>
          <CardContent>
            <HorizontalBarChart items={gpaDist} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Intervention Groups</CardTitle></CardHeader>
          <CardContent>
            <HorizontalBarChart items={interventionGroups} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
