"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OrderStepRow } from "@/lib/repositories/order-steps"

export interface UnitInfo {
  id: string          // OrderItemUnit.id
  unitIndex: number   // 1-based
  productName: string
  color: string
  /** Total number of units for this product (used to show/hide "unidad N" label) */
  totalUnits: number
}

interface OrderStepListProps {
  orderId: string
  initialSteps: OrderStepRow[]
  /** Flat list of all units across all items, ordered by item then unitIndex */
  units: UnitInfo[]
  /** Only true when order.status === "en_produccion" */
  canEdit: boolean
}

// â”€â”€ Single step button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StepButton({
  step,
  orderId,
  canEdit,
  onToggle,
  pending,
  hasError,
}: {
  step: OrderStepRow
  orderId: string
  canEdit: boolean
  onToggle: (id: string, current: boolean) => void
  pending: boolean
  hasError: boolean
}) {
  return (
    <li>
      <button
        type="button"
        disabled={!canEdit || pending}
        onClick={() => onToggle(step.id, step.completed)}
        className={cn(
          "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
          step.completed
            ? "bg-muted/40 text-muted-foreground"
            : "bg-card hover:bg-muted/30",
          canEdit ? "cursor-pointer" : "cursor-default",
          hasError && "outline outline-destructive"
        )}
      >
        {step.completed ? (
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-primary" />
        ) : (
          <Circle size={16} className="shrink-0 mt-0.5 text-muted-foreground" />
        )}
        <div className="min-w-0 grow">
          <span className={cn("text-sm font-medium", step.completed && "line-through opacity-60")}>
            {step.name}
          </span>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Clock size={11} />
            <span>{step.durationHours}h</span>
            {step.completed && step.completedAt && (
              <span className="ml-1">
                Â· {new Date(step.completedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>
        </div>
      </button>
      {hasError && (
        <p className="text-[11px] text-destructive px-3 pt-1">Error al guardar. IntentÃ¡ de nuevo.</p>
      )}
    </li>
  )
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function OrderStepList({ orderId, initialSteps, units, canEdit }: OrderStepListProps) {
  const [steps, setSteps] = useState(initialSteps)
  const [pending, startTransition] = useTransition()
  const [errorId, setErrorId] = useState<string | null>(null)

  const completedCount = steps.filter((s) => s.completed).length
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  function toggle(stepId: string, currentCompleted: boolean) {
    if (!canEdit) return
    const newCompleted = !currentCompleted
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, completed: newCompleted, completedAt: newCompleted ? new Date() : null } : s
      )
    )
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
        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId ? { ...s, completed: currentCompleted, completedAt: null } : s
          )
        )
        setErrorId(stepId)
      }
    })
  }

  if (steps.length === 0) return null

  // Build a unit â†’ steps map in unit order
  const unitMap = new Map(units.map((u) => [u.id, u]))
  const stepsByUnit = new Map<string, OrderStepRow[]>()
  const unlinkedSteps: OrderStepRow[] = []

  for (const step of steps) {
    if (step.orderItemUnitId && unitMap.has(step.orderItemUnitId)) {
      if (!stepsByUnit.has(step.orderItemUnitId)) stepsByUnit.set(step.orderItemUnitId, [])
      stepsByUnit.get(step.orderItemUnitId)!.push(step)
    } else {
      unlinkedSteps.push(step)
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
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

      {/* One card per unit */}
      {units.map((unit) => {
        const unitSteps = stepsByUnit.get(unit.id) ?? []
        if (unitSteps.length === 0) return null
        const label =
          unit.totalUnits > 1
            ? `${unit.productName}${unit.color ? ` (${unit.color})` : ""} â€” #${unit.unitIndex}`
            : `${unit.productName}${unit.color ? ` (${unit.color})` : ""}`

        return (
          <div key={unit.id} className="rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 border-b border-border">
              <p className="text-xs font-medium text-foreground">{label}</p>
            </div>
            <ul className="divide-y divide-border">
              {unitSteps.map((step) => (
                <StepButton
                  key={step.id}
                  step={step}
                  orderId={orderId}
                  canEdit={canEdit}
                  onToggle={toggle}
                  pending={pending}
                  hasError={errorId === step.id}
                />
              ))}
            </ul>
          </div>
        )
      })}

      {/* Legacy backfilled steps without a unit (no-op for new orders) */}
      {unlinkedSteps.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {unlinkedSteps.map((step) => (
            <StepButton
              key={step.id}
              step={step}
              orderId={orderId}
              canEdit={canEdit}
              onToggle={toggle}
              pending={pending}
              hasError={errorId === step.id}
            />
          ))}
        </ul>
      )}

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          Los pasos solo se pueden completar cuando el pedido estÃ¡ en producciÃ³n.
        </p>
      )}
    </div>
  )
}
