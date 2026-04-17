"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ProductStepRow } from "@/lib/repositories/admin/product-steps"

export type StepDraft = {
  /** undefined = new step not yet saved */
  id?: string
  name: string
  order: number
  durationHours: number
  requiredCategoryId: string | null
}

interface ProductStepsManagerProps {
  /** Existing steps loaded from DB (for edit mode) */
  initialSteps?: ProductStepRow[]
  /** Available categories for the requiredCategoryId selector */
  categories: { id: string; name: string }[]
  /** Called whenever steps change — parent reads this on save */
  onChange: (steps: StepDraft[]) => void
  /** When true, show inline validation errors */
  showErrors?: boolean
}

function emptyStep(order: number): StepDraft {
  return { name: "", order, durationHours: 0, requiredCategoryId: null }
}

export function ProductStepsManager({
  initialSteps = [],
  categories,
  onChange,
  showErrors = false,
}: ProductStepsManagerProps) {
  const [steps, setSteps] = useState<StepDraft[]>(
    initialSteps.map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order,
      durationHours: s.durationHours,
      requiredCategoryId: s.requiredCategoryId,
    }))
  )

  function notify(next: StepDraft[]) {
    setSteps(next)
    onChange(next)
  }

  function addStep() {
    notify([...steps, emptyStep(steps.length)])
  }

  function removeStep(index: number) {
    notify(
      steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i }))
    )
  }

  function moveStep(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    notify(next.map((s, i) => ({ ...s, order: i })))
  }

  function updateStep(index: number, field: keyof StepDraft, value: string | number | null) {
    notify(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const totalHours = steps.reduce((sum, s) => sum + (s.durationHours || 0), 0)

  return (
    <div className="space-y-3">
      {/* Empty-list error */}
      {showErrors && steps.length === 0 && (
        <p className="text-xs text-destructive">
          Agregá al menos un paso de producción.
        </p>
      )}

      {steps.map((step, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
        >
          {/* Step header */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide grow">
              Paso {i + 1}
            </span>

            {/* Reorder buttons */}
            <button
              type="button"
              disabled={i === 0}
              onClick={() => moveStep(i, -1)}
              aria-label="Subir paso"
              className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              disabled={i === steps.length - 1}
              onClick={() => moveStep(i, 1)}
              aria-label="Bajar paso"
              className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronDown size={14} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeStep(i)}
              aria-label="Eliminar paso"
              className="p-0.5 ml-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs">Nombre del paso</Label>
            <Input
              value={step.name}
              onChange={(e) => updateStep(i, "name", e.target.value)}
              placeholder="Ej: Ensamblado, Secado, Pintura..."
              className={cn(
                "h-8 text-sm",
                showErrors && !step.name.trim() && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {showErrors && !step.name.trim() && (
              <p className="text-[11px] text-destructive">El nombre es requerido.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Duration */}
            <div className="space-y-1">
              <Label className="text-xs">Duración (horas)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={step.durationHours || ""}
                onChange={(e) =>
                  updateStep(i, "durationHours", parseFloat(e.target.value) || 0)
                }
                className={cn(
                  "h-8 text-sm",
                  showErrors && !(step.durationHours > 0) && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {showErrors && !(step.durationHours > 0) && (
                <p className="text-[11px] text-destructive">Debe ser mayor a 0.</p>
              )}
            </div>

            {/* Required category */}
            <div className="space-y-1">
              <Label className="text-xs">Categoría requerida</Label>
              <Select
                value={step.requiredCategoryId ?? "none"}
                onValueChange={(v) =>
                  updateStep(i, "requiredCategoryId", v === "none" ? null : v)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sin requisito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    Sin requisito
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          className="text-xs h-8"
        >
          <Plus size={13} className="mr-1" />
          Agregar paso
        </Button>

        {steps.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Total: <span className="font-medium">{totalHours}h</span>
          </p>
        )}
      </div>
    </div>
  )
}
