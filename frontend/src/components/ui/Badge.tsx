import { cn, badgeClass } from "@/lib/utils"

interface BadgeProps {
  label: string
  className?: string
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap", badgeClass(label), className)}>
      {label}
    </span>
  )
}
