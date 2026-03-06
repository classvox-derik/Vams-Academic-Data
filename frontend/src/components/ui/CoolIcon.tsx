interface CoolIconProps {
  name: string
  size?: number
  className?: string
}

export function CoolIcon({ name, size = 18, className = "" }: CoolIconProps) {
  return (
    <i
      className={`ci-${name} ${className}`.trim()}
      style={{ fontSize: size }}
    />
  )
}
