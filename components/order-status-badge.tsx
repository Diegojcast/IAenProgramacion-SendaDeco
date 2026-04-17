import { ORDER_STATUS_LABELS, getStatusBadgeClass } from "@/lib/order-workflow"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        getStatusBadgeClass(status),
        className
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
