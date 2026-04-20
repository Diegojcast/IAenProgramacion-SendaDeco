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

function startOfTomorrow(): Date {
  // UTC midnight of tomorrow — Prisma @db.Date fields are stored as UTC midnight
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1))
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
 * Safety limit: maximum calendar days the scheduler will look ahead
 * when searching for worker availability. Prevents infinite loops when
 * no worker has any availability configured.
 */
const SCHEDULING_HORIZON_DAYS = 365

/**
 * Floating-point epsilon for remaining-hours comparisons.
 * Avoids creating near-zero tasks due to Float64 rounding.
 */
const HOURS_EPSILON = 0.001

type TaskToCreate = {
  orderId: string
  orderStepId: string
  workerId: string | null
  date: Date
  hoursAssigned: number
}

/** Builds a Map<workerId, Map<dateStr, bookedHours>> from existing tasks. */
function buildCommittedMap(
  tasks: { workerId: string | null; date: Date; hoursAssigned: number }[]
): Map<string, Map<string, number>> {
  const committed = new Map<string, Map<string, number>>()
  for (const t of tasks) {
    if (!t.workerId) continue
    const dateStr = toDateStr(t.date)
    if (!committed.has(t.workerId)) committed.set(t.workerId, new Map())
    const byDate = committed.get(t.workerId)!
    byDate.set(dateStr, (byDate.get(dateStr) ?? 0) + t.hoursAssigned)
  }
  return committed
}

/** Increments a worker's booked hours in the committed map (mutates in place). */
function addToCommitted(
  committed: Map<string, Map<string, number>>,
  workerId: string,
  dateStr: string,
  hours: number
): void {
  if (!committed.has(workerId)) committed.set(workerId, new Map())
  const byDate = committed.get(workerId)!
  byDate.set(dateStr, (byDate.get(dateStr) ?? 0) + hours)
}

/**
 * Returns the worker with the most available hours on `date`, or null if
 * no eligible worker has any capacity.
 */
function pickBestWorker(
  eligible: WorkerForScheduling[],
  date: Date,
  committed: Map<string, Map<string, number>>
): { worker: WorkerForScheduling; availableHours: number } | null {
  const dateStr = toDateStr(date)
  let best: WorkerForScheduling | null = null
  let bestAvailable = 0

  for (const worker of eligible) {
    const base = getWorkerBaseHours(worker, date)
    if (base <= 0) continue
    const used = committed.get(worker.id)?.get(dateStr) ?? 0
    const available = base - used
    if (available > bestAvailable) {
      bestAvailable = available
      best = worker
    }
  }

  return best ? { worker: best, availableHours: bestAvailable } : null
}

/**
 * Validates that every step requiring a skill has at least one assigned worker
 * who covers that skill. Throws `SchedulingValidationError` on the first gap found.
 */
async function validateSkillCoverage(
  steps: { id: string; requiredCategoryId: string | null; durationHours: number }[],
  workers: WorkerForScheduling[]
): Promise<void> {
  const coveredCategories = new Set(
    workers.flatMap((w) => w.categories.map((wc) => wc.categoryId))
  )
  const uncoveredStep = steps.find(
    (s) => s.requiredCategoryId && !coveredCategories.has(s.requiredCategoryId)
  )
  if (!uncoveredStep) return

  const cat = await prisma.category.findUnique({
    where: { id: uncoveredStep.requiredCategoryId! },
    select: { name: true },
  })
  const label = cat?.name ?? uncoveredStep.requiredCategoryId
  throw new SchedulingValidationError(
    `No hay trabajadores asignados con el skill requerido: "${label}"`
  )
}

/**
 * Builds a pre-indexed Map<categoryId, WorkerForScheduling[]> for O(1) lookup
 * of eligible workers per step.
 */
function buildWorkersByCategory(
  workers: WorkerForScheduling[]
): Map<string, WorkerForScheduling[]> {
  const map = new Map<string, WorkerForScheduling[]>()
  for (const worker of workers) {
    for (const { categoryId } of worker.categories) {
      if (!map.has(categoryId)) map.set(categoryId, [])
      map.get(categoryId)!.push(worker)
    }
  }
  return map
}

/**
 * Core scheduling loop. Walks steps sequentially and returns an array of
 * task rows to be inserted — pure in-memory, no DB side effects.
 */
function buildTasksToCreate(
  orderId: string,
  steps: { id: string; requiredCategoryId: string | null; durationHours: number }[],
  workersByCategory: Map<string, WorkerForScheduling[]>,
  committed: Map<string, Map<string, number>>,
  startDate: Date
): TaskToCreate[] {
  const tasks: TaskToCreate[] = []
  let currentDate = new Date(startDate)

  for (const step of steps) {
    const daysForStep = Math.max(1, Math.ceil(step.durationHours / 24))

    // Waiting/drying time — no worker needed, just advance the calendar pointer
    if (!step.requiredCategoryId) {
      currentDate = addDays(currentDate, daysForStep)
      continue
    }

    const eligibleWorkers = workersByCategory.get(step.requiredCategoryId) ?? []
    if (eligibleWorkers.length === 0) {
      currentDate = addDays(currentDate, daysForStep)
      continue
    }

    let remainingHours = step.durationHours
    let searchDate = new Date(currentDate)
    let daysSearched = 0
    let lastAssignedDate: Date | null = null

    while (remainingHours > HOURS_EPSILON && daysSearched < SCHEDULING_HORIZON_DAYS) {
      const pick = pickBestWorker(eligibleWorkers, searchDate, committed)

      if (pick) {
        const hoursAssigned = Math.min(pick.availableHours, remainingHours)
        tasks.push({
          orderId,
          orderStepId: step.id,
          workerId: pick.worker.id,
          date: new Date(searchDate),
          hoursAssigned,
        })
        addToCommitted(committed, pick.worker.id, toDateStr(searchDate), hoursAssigned)
        remainingHours -= hoursAssigned
        lastAssignedDate = new Date(searchDate)
      }

      searchDate = addDays(searchDate, 1)
      daysSearched++
    }

    // Pipeline: next step starts the day after the last assignment for this step
    currentDate = lastAssignedDate
      ? addDays(lastAssignedDate, 1)
      : addDays(currentDate, daysForStep)
  }

  return tasks
}

/**
 * Auto-schedule an order's steps starting from tomorrow.
 *
 * Rules:
 * - Steps run sequentially (respecting the `order` index).
 * - If a step has `requiredCategoryId`, assign it to eligible workers day-by-day.
 *   Each day, the eligible worker with the most unbooked hours is chosen.
 *   Multiple ScheduledTask rows are created if the step spans several days.
 * - If a step has no `requiredCategoryId` (e.g. drying/waiting time), advance
 *   the date pointer by ⌈durationHours / 24⌉ calendar days without creating rows.
 *
 * Validates skill coverage BEFORE deleting the previous schedule so that
 * a validation error never leaves the order without a schedule.
 * Returns the newly created tasks.
 */
export async function scheduleOrder(orderId: string): Promise<ScheduledTaskRow[]> {
  const startDate = startOfTomorrow()

  // 1. Fetch steps (validate early before any destructive operation)
  const steps = await prisma.orderStep.findMany({
    where: { orderId },
    orderBy: { order: "asc" },
  })
  if (steps.length === 0) return []

  // 2. Fetch assigned workers with their skills and future availability
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

  // 3. Validate skill coverage — throws before any destructive DB write
  await validateSkillCoverage(steps, workers)

  // 4. Safe to clear the old schedule now that validation passed
  await prisma.scheduledTask.deleteMany({ where: { orderId } })

  // 5. Build committed-hours map from all remaining tasks across other orders
  const existingTasks = await prisma.scheduledTask.findMany({
    where: { date: { gte: startDate } },
    select: { workerId: true, date: true, hoursAssigned: true },
  })
  const committed = buildCommittedMap(existingTasks)

  // 6. Run the scheduling algorithm (pure, no DB calls)
  const workersByCategory = buildWorkersByCategory(workers)
  const tasksToCreate = buildTasksToCreate(orderId, steps, workersByCategory, committed, startDate)

  // 7. Persist
  if (tasksToCreate.length > 0) {
    await prisma.scheduledTask.createMany({ data: tasksToCreate })
  }

  return getScheduledTasksForOrder(orderId)
}
