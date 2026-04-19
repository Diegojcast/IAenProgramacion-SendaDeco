/**
 * Pure client-safe utilities for ScheduledTask display.
 * No Prisma or Node.js imports — safe to use in Client Components.
 */

import type { ScheduledTaskRow } from "@/lib/repositories/scheduled-tasks"

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * A grouped view of ScheduledTaskRow[].
 * Multiple rows with the same orderId + workerId + date + step name are
 * merged into a single entry with their hoursAssigned summed.
 * The original IDs are preserved in `ids` for toggle operations.
 */
export type GroupedTaskRow = {
  /** All original task IDs in this group */
  ids: string[]
  orderId: string
  orderStepId: string
  workerId: string | null
  date: Date
  /** Sum of hoursAssigned across all tasks in the group */
  hoursAssigned: number
  /** true only when every task in the group is completed */
  completed: boolean
  orderStep: { name: string; order: number; durationHours: number }
  parentOrder: { id: string; nombre: string; status: string }
  worker: { id: string; firstName: string; lastName: string } | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function toDateStr(date: Date): string {
  // Use UTC parts — Prisma @db.Date fields arrive as UTC midnight.
  // Using local parts would shift the date backwards in UTC- timezones.
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

// ── Grouping ─────────────────────────────────────────────────────────────────

export function groupScheduledTasks(tasks: ScheduledTaskRow[]): GroupedTaskRow[] {
  const map = new Map<string, GroupedTaskRow>()
  for (const task of tasks) {
    const dateKey = toDateStr(task.date)
    const key = `${task.orderId}|${task.workerId ?? ""}|${dateKey}|${task.orderStep.name}`
    const existing = map.get(key)
    if (existing) {
      existing.ids.push(task.id)
      existing.hoursAssigned += task.hoursAssigned
      existing.completed = existing.completed && task.completed
    } else {
      map.set(key, {
        ids: [task.id],
        orderId: task.orderId,
        orderStepId: task.orderStepId,
        workerId: task.workerId,
        date: task.date,
        hoursAssigned: task.hoursAssigned,
        completed: task.completed,
        orderStep: task.orderStep,
        parentOrder: task.parentOrder,
        worker: task.worker,
      })
    }
  }
  return [...map.values()]
}
