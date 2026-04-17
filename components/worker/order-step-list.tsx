"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OrderStepRow } from "@/lib/repositories/order-steps"

interface OrderStepListProps {
  orderId: string
  initialSteps: OrderStepRow[]
  /** Only true when order.status === "en_produccion" */
  canEdit: boolean
}

export function OrderStepList({ orderId, initialSteps, canEdit }: OrderStepListProps) {
  const [steps, setSteps] = useState(initialSteps)
  const [pending, startTransition] = useTransition()
  const [errorId, setErrorId] = useState<string | null>(null)

  const completedCount = steps.filter((s) => s.completed).length
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  async function toggle(stepId: string, currentCompleted: boolean) {
    if (!canEdit) return

    const newCompleted = !currentCompleted
    // Optimistic update
    setSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, completed: newCompleted, completedAt: newCompleted ? new Date() : null } : s))

    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/steps/${stepId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: newCompleted }),
        })
        if (!res.ok) throw new Error()
        setErrorId(null)
      } catch {
        // Roll back
        setSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, completed: currentCompleted, completedAt: null } : s))
        setErrorId(stepId)
      }
    })
  }

  if (steps.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedCount} de {steps.length} pasos completados</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              disabled={!canEdit || pending}
              onClick={() => toggle(step.id, step.completed)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                step.completed
                  ? "border-border/50 bg-muted/40 text-muted-foreground"
                  : "border-border bg-card hover:bg-muted/30",
                canEdit && "cursor-pointer",
                !canEdit && "cursor-default",
                errorId === step.id && "border-destructive"
              )}
            >
              {step.completed ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-primary" />
              ) : (
                <Circle size={16} className="shrink-0 mt-0.5 text-muted-foreground" />
              )}
              <div className="min-w-0 grow">
                <span className={cn(
                  "text-sm font-medium",
                  step.completed && "line-through opacity-60"
                )}>
                  {step.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>{step.durationHours}h</span>
                  {step.completed && step.completedAt && (
                    <span className="ml-1">
                      · {new Date(step.completedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>
              </div>
            </button>
            {errorId === step.id && (
              <p className="text-[11px] text-destructive px-3 pt-1">Error al guardar. Intentá de nuevo.</p>
            )}
          </li>
        ))}
      </ul>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          Los pasos solo se pueden completar cuando el pedido está en producción.
        </p>
      )}
    </div>
  )
}
