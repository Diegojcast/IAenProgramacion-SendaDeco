"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Calendar, Clock, ExternalLink } from "lucide-react"
import { groupScheduledTasks } from "@/lib/scheduled-tasks-utils"
import type { ScheduledTaskRow } from "@/lib/repositories/scheduled-tasks"
import type { GroupedTaskRow } from "@/lib/scheduled-tasks-utils"

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

function formatDateHeading(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatHours(h: number): string {
  if (h === 1) return "1 hora"
  return `${h % 1 === 0 ? h : h.toFixed(1)} hs`
}

function groupByDate(
  tasks: GroupedTaskRow[]
): { dateKey: string; label: string; tasks: GroupedTaskRow[] }[] {
  const map = new Map<string, GroupedTaskRow[]>()
  for (const t of tasks) {
    const key = toDateKey(t.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return [...map.entries()].map(([dateKey, tasks]) => ({
    dateKey,
    label: formatDateHeading(dateKey),
    tasks,
  }))
}

// ── Grouped task item ─────────────────────────────────────────────────────────

function TaskItem({ task }: { task: GroupedTaskRow }) {
  const [completed, setCompleted] = useState(task.completed)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    const next = !completed
    setCompleted(next)
    startTransition(async () => {
      // Toggle all original task IDs in the group in parallel
      const results = await Promise.all(
        task.ids.map((id) =>
          fetch(`/api/scheduled-tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: next }),
          })
        )
      )
      if (results.some((r) => !r.ok)) {
        setCompleted(!next) // rollback
      }
    })
  }

  return (
    <div
      className={`flex items-start gap-3 py-3 px-4 rounded-lg border transition-colors ${
        completed
          ? "bg-muted/40 border-border/50"
          : "bg-card border-border hover:border-foreground/20"
      } ${pending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <button
        type="button"
        onClick={toggle}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={completed ? "Marcar como pendiente" : "Marcar como completada"}
      >
        {completed ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${completed ? "line-through text-muted-foreground" : ""}`}
          >
            {task.orderStep.name}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} />
            {formatHours(task.hoursAssigned)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-muted-foreground truncate">
            Pedido de {task.parentOrder.nombre}
          </span>
          <Link
            href={`/mi-trabajo/${task.parentOrder.id}`}
            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline shrink-0"
          >
            ver
            <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface WorkerScheduleProps {
  tasks: ScheduledTaskRow[]
}

export function WorkerSchedule({ tasks }: WorkerScheduleProps) {
  // Group tasks before rendering — pure display transformation, no data loss
  const grouped = groupScheduledTasks(tasks)

  if (grouped.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-3 text-muted-foreground">
        <Calendar size={36} className="opacity-30" />
        <p className="text-sm">No hay tareas programadas.</p>
        <p className="text-xs opacity-70 text-center max-w-xs">
          Un administrador puede generar la agenda desde el detalle de cada pedido.
        </p>
      </div>
    )
  }

  const dateGroups = groupByDate(grouped)

  return (
    <div className="space-y-6">
      {dateGroups.map((group) => {
        const done = group.tasks.filter((t) => t.completed).length
        const total = group.tasks.length

        return (
          <div key={group.dateKey} className="space-y-2">
            {/* Date heading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium capitalize">{group.label}</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {done}/{total} completadas
              </span>
            </div>

            {/* Grouped tasks */}
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <TaskItem key={task.ids[0]} task={task} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}


