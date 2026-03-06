import type { StudentProfile } from "./studentDataAggregator"
import { formatName } from "./utils"

export function buildAnalysisPrompt(profile: StudentProfile): string {
  const studentName = formatName(profile.studentName)
  const dataJson = JSON.stringify(profile, null, 2)

  return `You are an expert middle school teacher and data analyst at Valor Academy Middle School (VAMS) in Los Angeles. Analyze the student data below for **${studentName}**. Use ONLY the provided data — do not invent or assume anything.

**Data sources include:** FIAB ELA/Math results (scale scores, performance levels), CAST Science interim assessments, iReady Reading/Math diagnostics (scale scores, placements, relative placement), GPA sheets (Q1, S1, Core GPA), and student score distributions. Search all sections for this student's records.

**Important rules:**
- Assume all EL students are already enrolled in a dedicated ELD class and receiving integrated ELD with content instruction. Do not recommend enrolling in ELD or starting integrated ELD — focus on strategies that enhance the support already in place.
- Never mention or recommend ClassVox.
- Use ONLY the data provided. If no data exists for a subject, state "No data available" in that section.

---

**You MUST follow this EXACT output template. Use these exact headings. Do not add extra headings, reorder sections, or skip any section.**

# Student Overview

Write exactly 2-3 sentences summarizing this student's overall academic standing. Mention their grade level, strongest subject area, and the area needing the most support. Keep the tone encouraging and professional.

---

# Assessment Data

| Subject | Assessment | Date | Scale Score | Performance Level | Placement |
|---------|-----------|------|-------------|-------------------|-----------|

Include one row per assessment record found. Use the exact data values — do not round or estimate. If a column has no value for a row, write "—". Sort rows by subject (ELA, Math, Reading, Science) then by date.

---

# Academic Performance

## English Language Arts
Summarize ELA performance in 2-3 sentences. Reference specific scale scores and performance levels. Note trends if multiple assessments exist.

## Mathematics
Summarize Math performance in 2-3 sentences. Include placement level and any grade-level gaps (e.g., "performing 1 grade level below").

## Science
Summarize CAST/Science performance in 2-3 sentences. Reference specific interim assessments and performance levels.

## Reading
Summarize iReady Reading diagnostic results in 2-3 sentences. Include placement and relative placement if available.

## GPA
State the student's GPA(s) if available (Q1, S1, Core). Provide brief context (e.g., "on track" or "at risk").

*If no data exists for a subject above, write: "No [subject] data available for this student."*

---

# Recommended Support Strategies

Provide exactly 5 numbered strategies. Each strategy must be:
- Specific to this student's data (reference actual scores or performance levels)
- Actionable for a classroom teacher
- Feasible in a charter middle school setting

Focus areas should include: differentiated instruction, targeted interventions, i-Ready module recommendations, ELD vocabulary and language scaffolds for EL students, and progress monitoring checkpoints.

1. **[Strategy Title]:** [1-2 sentence description tied to this student's data]
2. **[Strategy Title]:** [1-2 sentence description tied to this student's data]
3. **[Strategy Title]:** [1-2 sentence description tied to this student's data]
4. **[Strategy Title]:** [1-2 sentence description tied to this student's data]
5. **[Strategy Title]:** [1-2 sentence description tied to this student's data]

---

# Next Steps

Write exactly 2-3 sentences outlining immediate next steps for the teacher. Be specific and reference the highest-priority area from the data above.

---

**Student Data for ${studentName}:**
${dataJson}`
}
