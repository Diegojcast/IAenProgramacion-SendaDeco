"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DAY_LABELS = [
  { dow: 1, label: "Lunes" },
  { dow: 2, label: "Martes" },
  { dow: 3, label: "Miércoles" },
  { dow: 4, label: "Jueves" },
  { dow: 5, label: "Viernes" },
  { dow: 6, label: "Sábado" },
  { dow: 0, label: "Domingo" },
]

interface WorkerDefaultScheduleProps {
  workerId: string
  /** Called after apply so the calendar can reload */
  onApplied?: () => void
}

export function WorkerDefaultSchedule({ workerId, onApplied }: WorkerDefaultScheduleProps) {
  // hours[dow] = string input value (0–6, Sun=0)
  const [hours, setHours] = useState<Record<number, string>>(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, ""]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [applySuccess, setApplySuccess] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load existing config
  useEffect(() => {
    let live = true
    fetch(`/api/admin/workers/${workerId}/default-availability`)
      .then((r) => r.json())
      .then((json) => {
        if (!live) return
        const map: Record<number, string> = {}
        for (const row of json.defaults ?? []) {
          map[row.dayOfWeek] = row.hours === 0 ? "" : String(row.hours)
        }
        setHours(map)
      })
      .catch(() => {}) // non-critical — leave inputs empty
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [workerId])

  function setDay(dow: number, value: string) {
    setHours((prev) => ({ ...prev, [dow]: value }))
    setSaveSuccess(false)
    setApplySuccess(null)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const data = Object.entries(hours).map(([dow, val]) => ({
        dayOfWeek: Number(dow),
        hours: val === "" ? 0 : parseFloat(val),
      }))
      const res = await fetch(`/api/admin/workers/${workerId}/default-availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleApply() {
    setApplying(true)
    setError(null)
    setApplySuccess(null)
    try {
      // Save current values first, then apply
      const data = Object.entries(hours).map(([dow, val]) => ({
        dayOfWeek: Number(dow),
        hours: val === "" ? 0 : parseFloat(val),
      }))
      await fetch(`/api/admin/workers/${workerId}/default-availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })

      const res = await fetch(`/api/admin/workers/${workerId}/default-availability`, {
        method: "POST",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setApplySuccess(json.days ?? 0)
      onApplied?.()
      setTimeout(() => setApplySuccess(null), 5000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al aplicar")
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Configuración semanal</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Define las horas disponibles por defecto para cada día de la semana.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DAY_LABELS.map(({ dow, label }) => (
            <div key={dow} className="space-y-1">
              <Label htmlFor={`dow-${dow}`} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <Input
                id={`dow-${dow}`}
                type="number"
                min={0}
                step={0.5}
                value={hours[dow] ?? ""}
                onChange={(e) => setDay(dow, e.target.value)}
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || loading}>
          {saveSuccess ? (
            <><Check size={14} className="mr-1" /> Guardado</>
          ) : saving ? (
            "Guardando..."
          ) : (
            "Guardar configuración"
          )}
        </Button>

        <Button size="sm" onClick={handleApply} disabled={applying || loading}>
          {applying ? (
            <><RefreshCw size={14} className="mr-1 animate-spin" /> Aplicando...</>
          ) : applySuccess !== null ? (
            <><Check size={14} className="mr-1" /> {applySuccess} días actualizados</>
          ) : (
            <><RefreshCw size={14} className="mr-1" /> Aplicar al calendario</>
          )}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        "Aplicar al calendario" sobreescribe la disponibilidad de hoy hasta 2 meses adelante.
        Los cambios manuales posteriores seguirán funcionando normalmente.
      </p>
    </div>
  )
}
