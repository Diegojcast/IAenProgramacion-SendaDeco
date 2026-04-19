import { prisma } from "@/lib/db/prisma"
import { toDateStr } from "@/lib/scheduled-tasks-utils"

// Re-export client-safe types and utilities so server-side callers can use one import path
export type { GroupedTaskRow } from "@/lib/scheduled-tasks-utils"
export { groupScheduledTasks } from "@/lib/scheduled-tasks-utils"

// ── Errors ───────────────────────────────────────────────────────────────────

export class SchedulingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SchedulingValidationError"
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ScheduledTaskRow = {
  id: string
  orderId: string
  orderStepId: string
  workerId: string | null
  date: Date
  hoursAssigned: number
  completed: boolean
  completedAt: Date | null
  createdAt: Date
  orderStep: { name: string; order: number; durationHours: number }
  parentOrder: { id: string; nombre: string; status: string }
  worker: { id: string; firstName: string; lastName: string } | null
}

// ── Shared include ────────────────────────────────────────────────────────────

const taskInclude = {
  orderStep: { select: { name: true, order: true, durationHours: true } },
  parentOrder: { select: { id: true, nombre: true, status: true } },
  worker: { select: { id: true, firstName: true, lastName: true } },
} as const

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getScheduledTasksForOrder(
  orderId: string
): Promise<ScheduledTaskRow[]> {
  return prisma.scheduledTask.findMany({
    where: { orderId },
    orderBy: [{ date: "asc" }, { orderStep: { order: "asc" } }],
    include: taskInclude,
  })
}

export async function getScheduledTasksForWorker(
  workerId: string,
  from?: Date,
  to?: Date
): Promise<ScheduledTaskRow[]> {
  return prisma.scheduledTask.findMany({
    where: {
      workerId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "asc" }, { orderStep: { order: "asc" } }],
    include: taskInclude,
  })
}

export async function toggleScheduledTask(
  taskId: string,
  completed: boolean
): Promise<ScheduledTaskRow> {
  return prisma.scheduledTask.update({
    where: { id: taskId },
    data: { completed, completedAt: completed ? new Date() : null },
    include: taskInclude,
  })
}

export async function deleteScheduledTasksForOrder(orderId: string): Promise<void> {
  await prisma.scheduledTask.deleteMany({ where: { orderId } })
}

// ── Scheduling algorithm ─────────────────────────────────────────────────────

type WorkerForScheduling = {
  id: string
  categories: { categoryId: string }[]
  defaultAvailability: { dayOfWeek: number; hours: number }[]
  availability: { date: Date; availableHours: number }[]
}

function startOfToday(): Date {
  // Produce UTC midnight for today so it compares correctly with Prisma @db.Date values
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

function startOfTomorrow(): Date {
  return addDays(startOfToday(), 1)
}

function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days,
  ))
}

function getWorkerBaseHours(worker: WorkerForScheduling, date: Date): number {
  const dateStr = toDateStr(date)
  // Specific date override takes precedence
  const specific = worker.availability.find((a) => toDateStr(a.date) === dateStr)
  if (specific !== undefined) return specific.availableHours
  // Fall back to default weekly availability — use UTC day to match UTC-midnight dates
  const dow = date.getUTCDay()
  const def = worker.defaultAvailability.find((d) => d.dayOfWeek === dow)
  return def?.hours ?? 0
}

/**
 * Auto-schedule an order's steps starting from today.
 *
 * Rules:
 * - Steps run sequentially (respecting the `order` index).
 * - If a step has `requiredCategoryId`, assign it to eligible workers day-by-day.
 *   Each day, the eligible worker with the most unbooked hours is chosen.
 *   Multiple ScheduledTask rows are created if the step spans several days.
 * - If a step has no `requiredCategoryId` (e.g. drying/waiting time), advance
 *   the current date pointer by ⌈durationHours / 24⌉ calendar days without
 *   creating any task row.
 *
 * Existing ScheduledTask rows for this order are deleted before re-scheduling.
 * Returns the newly created tasks.
 */
export async function scheduleOrder(orderId: string): Promise<ScheduledTaskRow[]> {
  // 1. Clear previous schedule for this order
  await prisma.scheduledTask.deleteMany({ where: { orderId } })

  // 2. Fetch steps sorted by order index
  const steps = await prisma.orderStep.findMany({
    where: { orderId },
    orderBy: { order: "asc" },
  })
  if (steps.length === 0) return []

  const today = startOfToday()
  // Scheduling starts from tomorrow — never assign past or same-day tasks
  const startDate = startOfTomorrow()

  // 3. Fetch only the workers assigned to this order, with skill categories and availability
  const assignedWorkerIds = (
    await prisma.orderWorker.findMany({
      where: { orderId },
      select: { workerId: true },
    })
  ).map((ow) => ow.workerId)

  const workers: WorkerForScheduling[] = await prisma.worker.findMany({
    where: { id: { in: assignedWorkerIds } },
    include: {
      categories: { select: { categoryId: true } },
      defaultAvailability: { select: { dayOfWeek: true, hours: true } },
      availability: {
        where: { date: { gte: startDate } },
        select: { date: true, availableHours: true },
      },
    },
  })

  // 3b. Validate: every required skill has at least one assigned worker covering it
  const coveredCategoryIds = new Set(workers.flatMap((w) => w.categories.map((wc) => wc.categoryId)))
  const uncoveredStep = steps.find(
    (s) => s.requiredCategoryId && !coveredCategoryIds.has(s.requiredCategoryId)
  )
  if (uncoveredStep) {
    // Fetch the category name for a friendlier error
    const cat = await prisma.category.findUnique({
      where: { id: uncoveredStep.requiredCategoryId! },
      select: { name: true },
    })
    const label = cat?.name ?? uncoveredStep.requiredCategoryId
    throw new SchedulingValidationError(
      `No hay trabajadores asignados con el skill requerido: "${label}"`
    )
  }

  // 4. Now it is safe to clear the previous schedule and rebuild
  await prisma.scheduledTask.deleteMany({ where: { orderId } })
  const existingTasks = await prisma.scheduledTask.findMany({
    where: { date: { gte: startDate } },
    select: { workerId: true, date: true, hoursAssigned: true },
  })
  // Map: workerId → dateStr → total hours already booked
  const committed = new Map<string, Map<string, number>>()
  for (const t of existingTasks) {
    if (!t.workerId) continue
    const dateStr = toDateStr(t.date)
    if (!committed.has(t.workerId)) committed.set(t.workerId, new Map())
    const d = committed.get(t.workerId)!
    d.set(dateStr, (d.get(dateStr) ?? 0) + t.hoursAssigned)
  }

  // 6. Walk through steps, building task rows in memory
  const MAX_SEARCH_DAYS = 365
  let currentDate = new Date(startDate)

  const tasksToCreate: Array<{
    orderId: string
    orderStepId: string
    workerId: string | null
    date: Date
    hoursAssigned: number
  }> = []

  for (const step of steps) {
    // ── Waiting/drying time: no worker needed ─────────────────────────────
    if (!step.requiredCategoryId) {
      const daysToAdvance = Math.max(1, Math.ceil(step.durationHours / 24))
      currentDate = addDays(currentDate, daysToAdvance)
      continue
    }

    // ── Skill-based step: assign to eligible workers ──────────────────────
    const eligibleWorkers = workers.filter((w) =>
      w.categories.some((wc) => wc.categoryId === step.requiredCategoryId)
    )

    if (eligibleWorkers.length === 0) {
      // No worker can do this step — skip ahead
      currentDate = addDays(currentDate, Math.max(1, Math.ceil(step.durationHours / 24)))
      continue
    }

    let remainingHours = step.durationHours
    let searchDate = new Date(currentDate)
    let dayCount = 0
    let lastAssignedDate: Date | null = null

    while (remainingHours > 0.001 && dayCount < MAX_SEARCH_DAYS) {
      const dateStr = toDateStr(searchDate)

      // Pick the eligible worker with the most available hours today
      let bestWorker: WorkerForScheduling | null = null
      let bestAvailable = 0

      for (const worker of eligibleWorkers) {
        const base = getWorkerBaseHours(worker, searchDate)
        if (base <= 0) continue
        const used = committed.get(worker.id)?.get(dateStr) ?? 0
        const avail = base - used
        if (avail > bestAvailable) {
          bestAvailable = avail
          bestWorker = worker
        }
      }

      if (bestWorker && bestAvailable > 0) {
        const toAssign = Math.min(bestAvailable, remainingHours)
        tasksToCreate.push({
          orderId,
          orderStepId: step.id,
          workerId: bestWorker.id,
          date: new Date(searchDate),
          hoursAssigned: toAssign,
        })
        // Update in-memory committed map
        if (!committed.has(bestWorker.id)) committed.set(bestWorker.id, new Map())
        const d = committed.get(bestWorker.id)!
        d.set(dateStr, (d.get(dateStr) ?? 0) + toAssign)

        remainingHours -= toAssign
        lastAssignedDate = new Date(searchDate)
      }

      searchDate = addDays(searchDate, 1)
      dayCount++
    }

    // Advance pointer to the day after the last assignment (pipeline effect)
    currentDate = lastAssignedDate
      ? addDays(lastAssignedDate, 1)
      : addDays(currentDate, Math.max(1, Math.ceil(step.durationHours / 24)))
  }

  // 7. Persist all new tasks
  if (tasksToCreate.length > 0) {
    await prisma.scheduledTask.createMany({ data: tasksToCreate })
  }

  return getScheduledTasksForOrder(orderId)
}
