import type { DataStore } from "@/data/useData"

// --- Types ---

export interface StudentProfile {
  studentId: string
  studentName: string
  gradeLevel: string
  homeroom: string
  demographics: {
    gender: string
    ethnicity: string
    languageFluency: string
    sped: string
    eld: string
  }
  sections: StudentDataSection[]
}

export interface StudentDataSection {
  category: string
  sheetName: string
  label: string
  headers: string[]
  rows: Record<string, string>[]
}

// --- Sheet matching config ---

interface SheetMatchConfig {
  idColumn?: string
  nameColumn: string
  category: string
  label: string
  isUpperCase?: boolean
  gradeFilter?: string // Only search this sheet if student is in this grade
}

const SHEET_CONFIGS: Record<string, SheetMatchConfig> = {
  // Rosters (skip — we already extract demographics from Master Roster)
  "Roster": { idColumn: "Student ID", nameColumn: "Student Name", category: "roster", label: "Roster" },

  // iReady D2 Reading
  "5th D2 Reading": { nameColumn: "Student", category: "iready-reading", label: "5th D2 Reading (iReady)", gradeFilter: "5" },
  "6th D2 Reading": { nameColumn: "Student", category: "iready-reading", label: "6th D2 Reading (iReady)", gradeFilter: "6" },
  "7th D2 Reading": { nameColumn: "Student", category: "iready-reading", label: "7th D2 Reading (iReady)", gradeFilter: "7" },
  "8th D2 Reading": { nameColumn: "Student", category: "iready-reading", label: "8th D2 Reading (iReady)", gradeFilter: "8" },

  // iReady D2 Math
  "5th D2 Math": { nameColumn: "Student", category: "iready-math", label: "5th D2 Math (iReady)", gradeFilter: "5" },
  "6th D2 Math": { nameColumn: "Student", category: "iready-math", label: "6th D2 Math (iReady)", gradeFilter: "6" },
  "7th D2 Math": { nameColumn: "Student", category: "iready-math", label: "7th D2 Math (iReady)", gradeFilter: "7" },
  "8th D2 Math": { nameColumn: "Student", category: "iready-math", label: "8th D2 Math (iReady)", gradeFilter: "8" },

  // iReady D1 Reading
  "5th D1 Reading": { nameColumn: "Student", category: "iready-reading", label: "5th D1 Reading (iReady)", gradeFilter: "5" },
  "6th Reading": { nameColumn: "Student", category: "iready-reading", label: "6th D1 Reading (iReady)", gradeFilter: "6" },
  "7th Reading": { nameColumn: "Student", category: "iready-reading", label: "7th D1 Reading (iReady)", gradeFilter: "7" },
  "8th Reading": { nameColumn: "Student", category: "iready-reading", label: "8th D1 Reading (iReady)", gradeFilter: "8" },

  // iReady D1 Math
  "5th Math": { nameColumn: "Student", category: "iready-math", label: "5th D1 Math (iReady)", gradeFilter: "5" },
  "6th Math": { nameColumn: "Student", category: "iready-math", label: "6th D1 Math (iReady)", gradeFilter: "6" },
  "7th Math": { nameColumn: "Student", category: "iready-math", label: "7th D1 Math (iReady)", gradeFilter: "7" },
  "8th Math": { nameColumn: "Student", category: "iready-math", label: "8th D1 Math (iReady)", gradeFilter: "8" },

  // VAES (prior year scores)
  "5th VAES 24-25 Reading": { idColumn: "student id", nameColumn: "student", category: "iready-reading", label: "5th VAES 24-25 Reading", gradeFilter: "5" },
  "5th VAES 24-25 Math": { idColumn: "student id", nameColumn: "student", category: "iready-math", label: "5th VAES 24-25 Math", gradeFilter: "5" },

  // Prior year iReady (24-25)
  "6th 24-25 Reading": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-reading", label: "6th 24-25 Reading", gradeFilter: "6" },
  "6th 24-25 Math": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-math", label: "6th 24-25 Math", gradeFilter: "6" },
  "7th 24-25 Reading": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-reading", label: "7th 24-25 Reading", gradeFilter: "7" },
  "7th 24-25 Math": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-math", label: "7th 24-25 Math", gradeFilter: "7" },
  "8th 24-25 Reading": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-reading", label: "8th 24-25 Reading", gradeFilter: "8" },
  "8th 24-25 Math": { idColumn: "Student ID", nameColumn: "Full Name", category: "iready-math", label: "8th 24-25 Math", gradeFilter: "8" },

  // CAASPP
  "24-25 CAASPP ELA": { nameColumn: "Full Name", category: "caaspp", label: "CAASPP ELA" },
  "24-25 CAASPP Math": { nameColumn: "Full Name", category: "caaspp", label: "CAASPP Math" },
  "5th 24-25 CAASPP Scores": { idColumn: "Student ID1", nameColumn: "Student Name", category: "caaspp", label: "5th CAASPP Scores", gradeFilter: "5" },

  // IAB
  "IAB ELA Results": { nameColumn: "Full Name", category: "iab", label: "IAB ELA (Round 1)", isUpperCase: true },
  "IAB2 ELA Results": { nameColumn: "Full Name", category: "iab", label: "IAB ELA (Round 2)", isUpperCase: true },
  "IAB Math Results": { nameColumn: "Full Name", category: "iab", label: "IAB Math (Round 1)", isUpperCase: true },
  "IAB2 Math Results": { nameColumn: "Full Name", category: "iab", label: "IAB Math (Round 2)", isUpperCase: true },

  // CAST
  "CAST IA": { nameColumn: "Full Name", category: "cast", label: "CAST Interim Assessment", isUpperCase: true },
  "24-25 CAST": { nameColumn: "Full name", category: "cast", label: "CAST 24-25" },

  // GPAs
  "Q1 GPAs": { idColumn: "Stu ID", nameColumn: "Student Name", category: "gpa", label: "Quarter 1 GPA" },
  "S1 GPAs": { idColumn: "Stu ID", nameColumn: "Student Name", category: "gpa", label: "Semester 1 GPA" },
  "3.3 GPA": { idColumn: "Student ID", nameColumn: "Student Name", category: "gpa", label: "Core GPA (3.3)" },

  // Grade-level overview sheets
  "5th Grade": { nameColumn: "Student", category: "grade-overview", label: "5th Grade Overview", gradeFilter: "5" },
  "6th Grade": { nameColumn: "Student", category: "grade-overview", label: "6th Grade Overview", gradeFilter: "6" },
  "7th Grade": { nameColumn: "Student", category: "grade-overview", label: "7th Grade Overview", gradeFilter: "7" },
  "8th Grade": { nameColumn: "Student", category: "grade-overview", label: "8th Grade Overview", gradeFilter: "8" },

  // Intervention groups
  "3+ Grade Levels Below": { nameColumn: "Student", category: "intervention", label: "3+ Grade Levels Below" },
  "Writing Group": { nameColumn: "Student", category: "intervention", label: "Writing Group" },
  "Phonics Support": { nameColumn: "Student", category: "intervention", label: "Phonics Support" },
  "Students of Concern": { nameColumn: "Student", category: "intervention", label: "Students of Concern" },
  "Duya Cohort 2": { idColumn: "Student id", nameColumn: "Student", category: "intervention", label: "Duya Cohort 2" },
}

// --- Matching helpers ---

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

function findStudentRows(
  rows: Record<string, string>[],
  config: SheetMatchConfig,
  studentId: string,
  studentName: string
): Record<string, string>[] {
  // Try ID match first
  if (config.idColumn) {
    const idMatches = rows.filter(r => r[config.idColumn!] === studentId)
    if (idMatches.length > 0) return idMatches
  }

  // Fall back to name match
  const normalizedTarget = normalizeName(studentName)
  return rows.filter(r => {
    const val = r[config.nameColumn]
    if (!val) return false
    const normalizedVal = config.isUpperCase
      ? normalizeName(val)
      : normalizeName(val)
    return normalizedVal === normalizedTarget
  })
}

// --- Main aggregation function ---

export function aggregateStudentData(data: DataStore, studentId: string): StudentProfile | null {
  const master = data["Master Roster"]
  if (!master) return null

  // Find student in Master Roster
  const studentRow = master.rows.find(r => r["Student ID"] === studentId)
  if (!studentRow) return null

  const studentName = studentRow["Student Name"] ?? ""
  const gradeLevel = studentRow["25-26 Grade Level"] ?? ""

  const profile: StudentProfile = {
    studentId,
    studentName,
    gradeLevel,
    homeroom: studentRow["25-26 Homeroom"] ?? "",
    demographics: {
      gender: studentRow["Gender"] ?? "",
      ethnicity: studentRow["Ethnicity"] ?? "",
      languageFluency: studentRow["Language Fluency"] ?? "",
      sped: studentRow["SPED"] ?? "",
      eld: studentRow["ELD"] ?? "",
    },
    sections: [],
  }

  // Iterate over all configured sheets
  for (const [sheetName, config] of Object.entries(SHEET_CONFIGS)) {
    // Skip grade-filtered sheets that don't match this student's grade
    if (config.gradeFilter && config.gradeFilter !== gradeLevel) continue

    const sheet = data[sheetName]
    if (!sheet || !sheet.rows.length) continue

    const matchingRows = findStudentRows(sheet.rows, config, studentId, studentName)
    if (matchingRows.length === 0) continue

    // Filter out columns that are just the student's name/ID to keep data clean
    const excludeCols = new Set([config.nameColumn])
    if (config.idColumn) excludeCols.add(config.idColumn)
    const headers = sheet.headers.filter(h => !excludeCols.has(h))

    profile.sections.push({
      category: config.category,
      sheetName,
      label: config.label,
      headers,
      rows: matchingRows,
    })
  }

  return profile
}
