import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-tab p-0.5 overflow-x-auto scrollbar-hide">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "rounded-md px-2.5 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
            active === t.key
              ? "bg-card text-heading shadow-sm"
              : "text-secondary hover:text-heading"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
