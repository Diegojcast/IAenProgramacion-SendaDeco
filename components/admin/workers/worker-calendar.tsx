"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// --- helpers -----------------------------------------------------------------

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function todayLocal() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// --- component ---------------------------------------------------------------

interface WorkerCalendarProps {
  workerId: string
  /** Increment to force a full refetch of availability data */
  refreshKey?: number
}

export function WorkerCalendar({ workerId, refreshKey = 0 }: WorkerCalendarProps) {
  const today = todayLocal()
  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + 2)

  const minYear = today.getFullYear()
  const minMonth = today.getMonth()
  const maxYear = maxDate.getFullYear()
  const maxMonth = maxDate.getMonth()

  const [viewYear, setViewYear] = useState(minYear)
  const [viewMonth, setViewMonth] = useState(minMonth)
  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // load availability --------------------------------------------------------

  useEffect(() => {
    let live = true
    setLoading(true)
    setFetchError(null)
    const fromStr = today.toISOString().slice(0, 10)
    const toStr = maxDate.toISOString().slice(0, 10)
    fetch(`/api/admin/workers/${workerId}/availability?from=${fromStr}&to=${toStr}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (!live) return
        const map: Record<string, number> = {}
        for (const row of (json.availability ?? []) as Array<{ date: string; availableHours: number }>) {
          map[row.date.slice(0, 10)] = row.availableHours
        }
        setAvailability(map)
      })
      .catch((err: Error) => { if (live) setFetchError(err.message) })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, refreshKey])

  // navigation ---------------------------------------------------------------

  const isAtMin = viewYear === minYear && viewMonth === minMonth
  const isAtMax = viewYear === maxYear && viewMonth === maxMonth

  function goPrev() {
    if (isAtMin) return
    setEditKey(null)
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }
  function goNext() {
    if (isAtMax) return
    setEditKey(null)
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  // edit helpers -------------------------------------------------------------

  function openEdit(key: string) {
    setEditKey(key)
    setEditValue(String(availability[key] ?? ""))
    setSaveError(null)
  }
  function closeEdit() { setEditKey(null); setEditValue(""); setSaveError(null) }

  const save = useCallback(async (key: string, raw: string) => {
    const hours = raw === "" ? 0 : parseFloat(raw)
    if (Number.isNaN(hours) || hours < 0) { setSaveError("Ingresa un numero valido (>= 0)"); return }
    setSaving(true); setSaveError(null)
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: key, availableHours: hours }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAvailability((prev) => {
        const next = { ...prev }
        if (hours === 0) delete next[key]
        else next[key] = hours
        return next
      })
      closeEdit()
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }, [workerId])

  // build cells --------------------------------------------------------------

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const cells: Array<number | null> = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // render -------------------------------------------------------------------

  return (
    <div style={{ border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", overflow: "hidden", background: "hsl(var(--card))" }}>

      {/* month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.3)" }}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev} disabled={isAtMin || loading}>
          <ChevronLeft size={16} />
        </Button>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext} disabled={isAtMax || loading}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid hsl(var(--border))" }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ padding: "0.5rem 0", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(var(--muted-foreground))" }}>
            {d}
          </div>
        ))}
      </div>

      {/* loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "4rem 0", color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>
          <Loader2 size={16} className="animate-spin" />
          Cargando disponibilidad...
        </div>
      )}

      {/* error */}
      {!loading && fetchError && (
        <div style={{ padding: "2rem", textAlign: "center", color: "hsl(var(--destructive))", fontSize: "0.875rem" }}>
          Error: {fetchError}
        </div>
      )}

      {/* day grid */}
      {!loading && !fetchError && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`pad-${i}`}
                  style={{ minHeight: "60px", borderBottom: "1px solid hsl(var(--border)/0.4)", borderRight: "1px solid hsl(var(--border)/0.4)", background: "hsl(var(--muted)/0.1)" }}
                />
              )
            }

            const key = dateKey(viewYear, viewMonth, day)
            const cellDate = new Date(viewYear, viewMonth, day)
            const isPast = cellDate < today
            const isToday = cellDate.getTime() === today.getTime()
            const isEditing = editKey === key
            const hours = availability[key] ?? 0
            const hasHours = hours > 0

            // Background priority: editing > has hours > today > default
            let cellBg = "transparent"
            if (isEditing) cellBg = "rgba(var(--primary-rgb, 99 102 241) / 0.12)"
            else if (hasHours && !isPast) cellBg = "rgb(220 252 231)" // green-100
            else if (isToday) cellBg = "rgb(239 246 255)" // blue-50

            return (
              <div
                key={key}
                onClick={() => { if (!isPast) openEdit(key) }}
                style={{
                  minHeight: "64px",
                  border: "1px solid hsl(var(--border))",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.25rem",
                  gap: "2px",
                  cursor: isPast ? "default" : "pointer",
                  opacity: isPast ? 0.45 : 1,
                  background: isPast ? "rgb(249 250 251)" : cellBg,
                  transition: "background 0.12s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  if (!isPast && !isEditing && !hasHours)
                    (e.currentTarget as HTMLDivElement).style.background = "rgb(241 245 249)"
                }}
                onMouseLeave={(e) => {
                  if (!isPast && !isEditing && !hasHours)
                    (e.currentTarget as HTMLDivElement).style.background = cellBg
                }}
              >
                <span style={{
                  display: "inline-flex",
                  height: "1.5rem",
                  width: "1.5rem",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: isToday ? 700 : 500,
                  background: isToday ? "hsl(var(--primary))" : undefined,
                  color: isToday ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                }}>
                  {day}
                </span>
                {hasHours && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgb(22 101 52)", lineHeight: 1 }}>
                    {hours}h
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* inline editor */}
      {editKey && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "0.75rem", borderTop: "1px solid hsl(var(--border))", padding: "0.75rem 1rem", background: "hsl(var(--muted)/0.2)" }}>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <p style={{ fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.2rem" }}>{editKey}</p>
            <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>Horas disponibles</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <Input
              autoFocus
              type="number"
              min={0}
              step={0.5}
              value={editValue}
              placeholder="0"
              className="h-8 w-24 text-sm"
              onChange={(e) => { setEditValue(e.target.value); setSaveError(null) }}
              onKeyDown={(e) => {
                if (e.key === "Enter") save(editKey, editValue)
                if (e.key === "Escape") closeEdit()
              }}
            />
            <Button size="sm" disabled={saving} onClick={() => save(editKey, editValue)}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={closeEdit}><X size={14} /></Button>
          </div>
          {saveError && <p style={{ width: "100%", fontSize: "0.75rem", color: "hsl(var(--destructive))" }}>{saveError}</p>}
        </div>
      )}

      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "0.5rem 1rem", borderTop: "1px solid hsl(var(--border))", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ display: "inline-block", height: "0.75rem", width: "0.75rem", borderRadius: "2px", background: "rgb(220 252 231)", border: "1px solid rgb(134 239 172)" }} />
          Con horas
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ display: "inline-block", height: "0.75rem", width: "0.75rem", borderRadius: "9999px", background: "hsl(var(--primary))" }} />
          Hoy
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ display: "inline-block", height: "0.75rem", width: "0.75rem", borderRadius: "2px", background: "rgb(249 250 251)", border: "1px solid rgb(209 213 219)" }} />
          Pasado
        </span>
      </div>
    </div>
  )
}
