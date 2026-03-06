import { cn } from "@/lib/utils"

interface SummaryItem {
  label: string
  value: number
  total: number
  color: "teal" | "gold" | "orange" | "coral" | "navy"
}

const borderMap = {
  teal: "border-t-teal",
  gold: "border-t-gold",
  orange: "border-t-orange",
  coral: "border-t-coral",
  navy: "border-t-navy",
}

export function SummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className="mb-4 sm:mb-5 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map(item => (
        <div key={item.label} className={cn("rounded-lg border-t-3 bg-card p-2.5 sm:p-4 text-center shadow-sm", borderMap[item.color])}>
          <div className="text-lg sm:text-2xl font-bold text-heading font-heading">{item.value}</div>
          <div className="mt-1 text-[0.7rem] text-secondary">{item.label}</div>
          {item.total > 0 && <div className="mt-0.5 text-[0.62rem] text-muted">{(item.value / item.total * 100).toFixed(0)}%</div>}
        </div>
      ))}
    </div>
  )
}
