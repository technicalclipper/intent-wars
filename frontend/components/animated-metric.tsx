"use client"

import { useEffect, useState } from "react"

interface AnimatedMetricProps {
  value: string | number
  label: string
  icon: string
  color: "primary" | "accent" | "secondary"
}

export default function AnimatedMetric({ value, label, icon, color }: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const numValue = Number.parseFloat(String(value))
    if (isNaN(numValue)) return

    let current = 0
    const increment = numValue / 20
    const interval = setInterval(() => {
      current += increment
      if (current >= numValue) {
        setDisplayValue(numValue)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current * 10) / 10)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [value])

  const colorClasses = {
    primary: "bg-primary/10 border-primary/30 text-primary",
    accent: "bg-accent/10 border-accent/30 text-accent",
    secondary: "bg-secondary/10 border-secondary/30 text-secondary",
  }

  return (
    <div
      className={`p-4 ${colorClasses[color]} border rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500`}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{displayValue}</p>
        <span className="text-lg">{icon}</span>
      </div>
    </div>
  )
}
