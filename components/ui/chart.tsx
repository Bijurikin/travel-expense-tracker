"use client"

import { type ReactNode } from "react"
import { type TooltipProps } from "recharts"

export type ChartConfig = Record<string, { label: string; color: string }>

interface ChartContainerProps {
  config: ChartConfig
  children: ReactNode
}

export function ChartContainer({ config, children }: ChartContainerProps) {
  return (
    <div style={{ width: "100%", height: 350 }}>
      {children}
    </div>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
}: TooltipProps<number, string> & { hideLabel?: boolean }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="text-sm font-medium">{label}</div>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="text-muted-foreground">{item.name}:</div>
          <div className="font-medium">{item.value} €</div>
        </div>
      ))}
    </div>
  )
}

export { Tooltip as ChartTooltip } from "recharts"
