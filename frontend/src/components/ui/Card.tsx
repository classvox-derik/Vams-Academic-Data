import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg bg-card shadow-sm", className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-3 pt-3 pb-2 sm:px-5 sm:pt-5", className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-sm font-semibold text-heading font-heading", className)}>{children}</h3>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-3 pb-3 sm:px-5 sm:pb-5", className)}>{children}</div>
}
