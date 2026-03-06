interface BarItem {
  label: string
  value: number
  color: string
}

export function HorizontalBarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 sm:gap-3">
          <span className="w-20 sm:w-28 shrink-0 text-right text-[0.65rem] sm:text-xs font-medium text-secondary">{item.label}</span>
          <div className="relative h-7 flex-1 rounded-md bg-tab">
            <div
              className="flex h-full items-center rounded-md pl-2.5 text-xs font-semibold text-white transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color, minWidth: item.value > 0 ? 'fit-content' : 0 }}
            >
              {item.value}
            </div>
          </div>
          <span className="w-10 text-right text-xs font-semibold text-heading">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

interface StackedItem {
  label: string
  segments: { name: string; value: number; color: string }[]
}

export function StackedBarChart({ items, legend }: { items: StackedItem[]; legend: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3.5">
      {items.map(item => {
        const total = item.segments.reduce((a, s) => a + s.value, 0)
        return (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-secondary">{item.label} (n={total})</span>
            <div className="flex h-8 overflow-hidden rounded-md bg-tab">
              {item.segments.map(seg => {
                const pct = total > 0 ? (seg.value / total) * 100 : 0
                if (pct === 0) return null
                return (
                  <div
                    key={seg.name}
                    title={`${seg.name}: ${seg.value} (${pct.toFixed(0)}%)`}
                    className="flex items-center justify-center text-[0.65rem] font-semibold text-white transition-all duration-500"
                    style={{ width: `${pct}%`, background: seg.color }}
                  >
                    {pct > 8 ? `${pct.toFixed(0)}%` : ""}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className="mt-2 flex flex-wrap gap-2 sm:gap-4">
        {legend.map(l => (
          <span key={l.name} className="flex items-center gap-1.5 text-xs text-secondary">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
            {l.name}
          </span>
        ))}
      </div>
    </div>
  )
}
