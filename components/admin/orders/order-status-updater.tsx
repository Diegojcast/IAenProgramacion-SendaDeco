"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORDER_STATUS_LABELS, isValidAdminTransition } from "@/lib/order-workflow"
import { OrderStatusBadge } from "@/components/order-status-badge"

const STATUS_OPTIONS = [
  { value: "pendiente" },
  { value: "en_produccion" },
  { value: "listo" },
  { value: "enviado" },
  { value: "entregado" },
] as const

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCancelled = status === "cancelado"

  async function handleChange(newStatus: string) {
    setUpdating(true)
    setError(null)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? "Error al actualizar")
      setUpdating(false)
      return
    }
    setStatus(newStatus)
    setUpdating(false)
    router.refresh()
  }

  const label = ORDER_STATUS_LABELS[status] ?? status

  if (isCancelled) {
    return <OrderStatusBadge status="cancelado" />
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={handleChange} disabled={updating}>
        <SelectTrigger className="h-8 w-48 text-sm">
          <SelectValue>
            <OrderStatusBadge status={status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => {
            const selectable = isValidAdminTransition(status, o.value)
            const isCurrent = o.value === status
            return (
              <SelectItem
                key={o.value}
                value={o.value}
                disabled={!selectable && !isCurrent}
                className={!selectable && !isCurrent ? "opacity-40" : ""}
              >
                {ORDER_STATUS_LABELS[o.value] ?? o.value}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {updating && <span className="text-xs text-muted-foreground">Guardando…</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
