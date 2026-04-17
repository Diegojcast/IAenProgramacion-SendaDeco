"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ORDER_STATUS_LABELS,
  ORDER_ADVANCE_LABEL,
  getNextOrderStatus,
} from "@/lib/order-workflow"
import { OrderStatusBadge } from "@/components/order-status-badge"

interface WorkerOrderStatusProps {
  orderId: string
  currentStatus: string
}

export function WorkerOrderStatus({ orderId, currentStatus }: WorkerOrderStatusProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextStatus = getNextOrderStatus(status)
  const nextLabel = nextStatus ? ORDER_ADVANCE_LABEL[nextStatus] : null

  async function handleAdvance() {
    if (!nextStatus) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/worker/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus(nextStatus)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <OrderStatusBadge status={status} />
      {nextLabel && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={handleAdvance}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={11} className="animate-spin" />
          ) : saved ? (
            <Check size={11} className="text-green-600" />
          ) : (
            <ArrowRight size={11} />
          )}
          {nextLabel}
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
