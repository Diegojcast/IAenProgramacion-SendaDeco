"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users, X, Ban, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Worker {
  id: string
  firstName: string
  lastName: string
}

interface OrderWorkersProps {
  orderId: string
  status: string
  allWorkers: Worker[]
  assignedWorkerIds: string[]
}

export function OrderWorkers({ orderId, status, allWorkers, assignedWorkerIds }: OrderWorkersProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedWorkerIds))
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCancelled = status === "cancelado"

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
    setError(null)
  }

  async function handleSaveWorkers() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign-workers", workerIds: Array.from(selected) }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar este pedido? No se puede deshacer.")) return
    setCancelling(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cancelar")
    } finally {
      setCancelling(false)
    }
  }

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Ban size={15} className="text-destructive" />
          Este pedido está cancelado.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users size={15} />
          Trabajadores asignados
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive text-xs"
          onClick={handleCancel}
          disabled={cancelling}
        >
          <Ban size={13} className="mr-1" />
          {cancelling ? "Cancelando..." : "Cancelar pedido"}
        </Button>
      </div>

      {allWorkers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay trabajadores registrados.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allWorkers.map((w) => (
            <label
              key={w.id}
              className="flex items-center gap-2 text-sm cursor-pointer select-none rounded-lg border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
            >
              <Checkbox
                checked={selected.has(w.id)}
                onCheckedChange={() => toggle(w.id)}
              />
              {w.firstName} {w.lastName}
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSaveWorkers} disabled={saving}>
          {saved ? (
            <><Check size={13} className="mr-1" /> Guardado</>
          ) : saving ? (
            "Guardando..."
          ) : (
            "Guardar asignación"
          )}
        </Button>
      </div>
    </div>
  )
}
