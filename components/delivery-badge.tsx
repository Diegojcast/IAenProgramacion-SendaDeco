import { Truck } from "lucide-react"

type DeliveryBadgeProps = {
  days: string
  className?: string
  showIcon?: boolean
}

export function DeliveryBadge({ days, className = "", showIcon = true }: DeliveryBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 text-[11px] tracking-wide text-muted-foreground ${className}`}
    >
      {showIcon && <Truck className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />}
      <span>Entrega estimada · {days} días</span>
    </div>
  )
}
