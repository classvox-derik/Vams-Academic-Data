import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function badgeClass(level: string): string {
  switch (level) {
    case "Standards Exceeded":
    case "Above Standard":
      return "bg-teal/10 text-teal"
    case "Standards Met":
    case "Near Standard":
      return "bg-gold/15 text-amber-700"
    case "Standards Nearly Met":
      return "bg-orange/15 text-orange"
    case "Standards Not Met":
    case "Below Standard":
      return "bg-coral/10 text-coral"
    default:
      return "bg-tab text-secondary"
  }
}

export function placementClass(val: string): string {
  if (val.includes("Mid or Above")) return "text-teal font-semibold"
  if (val.includes("Early On")) return "text-amber-600 font-semibold"
  if (val.includes("One Grade")) return "text-orange font-semibold"
  if (val.includes("Two Grade")) return "text-orange font-semibold"
  if (val.includes("Three or More") || val.includes("3 or More")) return "text-coral font-semibold"
  return ""
}

export function gpaClass(gpa: number): string {
  if (gpa >= 3.5) return "text-teal font-semibold"
  if (gpa >= 2.5) return "text-amber-600 font-semibold"
  return "text-coral font-semibold"
}

export function ordinal(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n) : n
  return num === 5 ? "5th" : num === 6 ? "6th" : num === 7 ? "7th" : "8th"
}

/** Capitalize only the first letter of each word in a name, lowercasing the rest. */
export function formatName(name: string): string {
  if (!name) return name
  return name.replace(/\S+/g, word => {
    // Preserve commas attached to words (e.g. "Hernandez,")
    if (word.endsWith(",")) {
      const base = word.slice(0, -1)
      return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + ","
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}

const NAME_HEADERS = new Set([
  "student name", "student", "full name", "name",
  "first name", "last name", "middle name",
])

export function isNameHeader(header: string): boolean {
  return NAME_HEADERS.has(header.toLowerCase().trim())
}
