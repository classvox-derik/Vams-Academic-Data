import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface KpiCardProps {
  icon: ReactNode
  value: string | number
  label: string
  detail?: string
  color?: "navy" | "teal" | "gold" | "orange" | "coral"
}

const bgMap = {
  navy: "bg-navy",
  teal: "bg-teal",
  gold: "bg-gold",
  orange: "bg-orange",
  coral: "bg-coral",
}

export function KpiCard({ icon, value, label, detail, color = "navy" }: KpiCardProps) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3.5 rounded-lg bg-card p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-white shrink-0", bgMap[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold text-heading font-heading leading-none">{value}</div>
        <div className="mt-1 text-[0.7rem] sm:text-xs font-medium text-secondary leading-tight">{label}</div>
        {detail && <div className="mt-0.5 text-[0.65rem] text-muted">{detail}</div>}
      </div>
    </div>
  )
}
