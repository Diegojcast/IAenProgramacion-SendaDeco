import { Truck } from "lucide-react"

type DeliveryBadgeProps = {
  days: string
  className?: string
  showIcon?: boolean
}

export function DeliveryBadge({ days, className = "", showIcon = true }: DeliveryBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      {showIcon && <Truck className="h-3 w-3" />}
      <span>Llega en {days} días</span>
    </div>
  )
}
