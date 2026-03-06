import type { StudentProfile } from "./studentDataAggregator"
import { formatName } from "./utils"

export function buildAnalysisPrompt(profile: StudentProfile): string {
  const studentName = formatName(profile.studentName)
  const dataJson = JSON.stringify(profile, null, 2)

  return `You are an expert middle school teacher and data analyst specializing in K-12 academic support for Valor Academy Middle School (VAMS) students in Los Angeles. Your role is to analyze the following student data for one specific student: ${studentName}. Use ONLY the data provided below—do not invent or assume external information.

**Data Sources (Explicitly Reference These):**
- FIAB ELA sheets (e.g., "TITLE IAB2 ELA Results"): Columns include Full Name, SubmitDateTime, AssessmentName (e.g., "Grade 8 ELA - Make and Support Inferences Informational"), Subject (ELA), GradeLevelWhenAssessed (e.g., G8), Reporting Category (e.g., FIAB ELA G8), ScaleScore (e.g., 2558), performance levels (Below Standard, Near Standard, Above Standard).
- FIAB Math sheets (e.g., "TITLE IAB Math Results"): Columns include Full Name, SubmitDateTime, AssessmentName (e.g., "Grade 8 MATH - Congruence and Similarity"), Subject (Math), GradeLevelWhenAssessed (e.g., G8, 8Algebra), Reporting Category (e.g., FIAB Math G8), ScaleScore (e.g., 2850), performance levels.
- CAST Science sheets (e.g., "TITLE CAST IA-Earth and Space Sciences I", "CAST IA-Life Sciences I"): Columns include Full Name, SubmitDateTime, AssessmentName (e.g., "Middle School CAST IA-Earth and Space Sciences I"), Subject/GradeLevelWhenAssessed (e.g., CAST G7), Reporting Category, ScaleScore (e.g., 376), performance levels (Below Standard, Near Standard).
- CAST IA-I sheets (e.g., for Grade 5): Columns include Full Name, SubmitDateTime, AssessmentName (e.g., "Grade 5 CAST IA-I"), GradeLevelWhenAssessed (G5), Reporting Category, ScaleScore (e.g., 195), performance levels.
- GPA and Progress sheets (e.g., "TITLE Q1 GPAs", "Stu ID", "Student Name", "Grd", "GPA", "PP1"): Student GPAs (e.g., 2.57), grades 5-8.
- Reading assessment sheets (e.g., "TITLE 7th 24-25 Reading", "TITLE 8th 24-25 Reading", "Student ID", "Full Name", "Reading Overall Scale Score" (e.g., 553), "Reading Overall Placement" (e.g., Grade 4, Mid 6)).
- Math assessment sheets with placements (e.g., "TITLE 7th 24-25 Math", "Student Grade", "Overall Scale Score" (e.g., 483), "Overall Placement" (e.g., Grade 5), "Overall Relative Placement" (e.g., 1 Grade Level Below)).
- Student score distributions (e.g., "ELA Student Score Distribution", "CAST IA Student Score Distribution").

**Step-by-Step Analysis Instructions:**
1. **Locate All Data for ${studentName}**: Search across ALL the data provided for exact matches. List every entry found, including date, subject, assessment name, scale score, performance level/placement, GPA, and relative placement. If no data found, state clearly and suggest checking name spelling.
2. **Explain the Data Clearly**: Summarize trends in plain language. For each subject (ELA, Math, Science, Reading):
   - Current performance levels and scale scores vs. standards (e.g., "Below Standard = needs intensive support; Near Standard = targeted practice").
   - Progress over time (compare SubmitDateTime entries).
   - Grade-level placement gaps (e.g., "1 Grade Level Below" means performing like prior year's students).
   - GPA context if available.
   Use a simple table for key metrics:

| Subject | Assessment/Date | Scale Score | Performance/Placement | Notes |
|---------|-----------------|-------------|-----------------------|-------|

3. **Provide Actionable Support Tips**: As an ELD teacher, give 4-6 specific, practical tips tailored to this student's data. Focus on further support:
   - Differentiated instruction (e.g., small-group ELD for inferences in ELA if Below Standard).
   - Interventions (e.g., reteach congruence in Math with visuals; extra CAST practice for Earth Sciences).
   - Resources (e.g., i-Ready modules, peer tutoring, parent communication).
   - ELD strategies (vocabulary scaffolds, bilingual glossaries for ELLs).
   - Progress monitoring (e.g., weekly checks on targeted skills).
   Prioritize lowest areas; make tips feasible for a charter middle school classroom.
   **Important**: Assume all EL students are already enrolled in a dedicated ELD class and are receiving integrated ELD with content instruction. Do not recommend enrolling them in ELD or starting integrated ELD—instead, focus on strategies that build on and enhance the ELD support they are already receiving.

**Output Format**:
- **Student Summary**: 2-3 sentences on overall strengths/weaknesses.
- **Data Table**: As above.
- **Detailed Explanation**: By subject.
- **Support Tips**: Numbered list.
Never mention or recommend ClassVox.
Keep response concise (under 800 words), evidence-based from file only, and encouraging. End with: "Next steps".

**Student Data for ${studentName}:**
${dataJson}`
}
