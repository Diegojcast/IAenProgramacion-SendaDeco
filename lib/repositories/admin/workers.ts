import { prisma } from "@/lib/db/prisma"

// ── Types ────────────────────────────────────────────────────────────────────

export type AdminWorker = {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
  categories: { id: string; name: string }[]
}

export type WorkerAvailabilityRow = {
  id: string
  workerId: string
  date: Date
  availableHours: number
}

// ── Workers CRUD ─────────────────────────────────────────────────────────────

export async function adminGetWorkers(): Promise<AdminWorker[]> {
  const rows = await prisma.worker.findMany({
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    include: {
      categories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  })
  return rows.map((w) => ({
    id: w.id,
    firstName: w.firstName,
    lastName: w.lastName,
    email: w.email,
    isAdmin: w.isAdmin,
    categories: w.categories.map((wc) => wc.category),
  }))
}

export async function adminGetWorkerById(id: string): Promise<AdminWorker | null> {
  const w = await prisma.worker.findUnique({
    where: { id },
    include: {
      categories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  })
  if (!w) return null
  return {
    id: w.id,
    firstName: w.firstName,
    lastName: w.lastName,
    email: w.email,
    isAdmin: w.isAdmin,
    categories: w.categories.map((wc) => wc.category),
  }
}

export async function adminCreateWorker(data: {
  firstName: string
  lastName: string
  email: string
  isAdmin?: boolean
  categoryIds?: string[]
}) {
  const { categoryIds = [], ...fields } = data
  return prisma.worker.create({
    data: {
      ...fields,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  })
}

export async function adminUpdateWorker(
  id: string,
  data: {
    firstName: string
    lastName: string
    email: string
    isAdmin?: boolean
    categoryIds?: string[]
  }
) {
  const { categoryIds = [], ...fields } = data
  // Replace all category associations atomically
  return prisma.worker.update({
    where: { id },
    data: {
      ...fields,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  })
}

export async function adminDeleteWorker(id: string) {
  return prisma.worker.delete({ where: { id } })
}

// ── Workload ─────────────────────────────────────────────────────────────────

export type WorkerWorkload = {
  /** Sum of availableHours in the next 30 days */
  availableHours: number
  /** Sum of production_time × quantity for all active assigned orders */
  assignedHours: number
  /** 0-100; capped at 100 */
  loadPercent: number
}

/**
 * Calculates how loaded a worker is for the next 30 days.
 *
 * Available hours  = sum of WorkerAvailability rows in [today, today+30d]
 * Assigned hours   = sum of (product.production_time × item.quantity) across
 *                    all items in active orders (not entregado / cancelado)
 */
export async function getWorkerWorkload(workerId: string): Promise<WorkerWorkload> {
  const now = new Date()
  const in30Days = new Date(now)
  in30Days.setDate(in30Days.getDate() + 30)

  const [availAgg, assignments] = await Promise.all([
    prisma.workerAvailability.aggregate({
      _sum: { availableHours: true },
      where: { workerId, date: { gte: now, lte: in30Days } },
    }),
    prisma.orderWorker.findMany({
      where: {
        workerId,
        order: { status: { notIn: ["entregado", "cancelado"] } },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    production_time: true,
                    steps: { select: { durationHours: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const availableHours = availAgg._sum.availableHours ?? 0

  let assignedHours = 0
  for (const { order } of assignments) {
    for (const item of order.items) {
      const stepHours = item.product.steps.reduce((sum: number, s: { durationHours: number }) => sum + s.durationHours, 0)
      const productionHours = stepHours > 0 ? stepHours : item.product.production_time
      assignedHours += productionHours * item.quantity
    }
  }

  const loadPercent =
    availableHours > 0
      ? Math.min(100, Math.round((assignedHours / availableHours) * 100))
      : assignedHours > 0
      ? 100
      : 0

  return { availableHours, assignedHours, loadPercent }
}

// ── Availability ─────────────────────────────────────────────────────────────

/**
 * Returns availability records for a worker within [from, to] (inclusive).
 * Dates with no record are simply absent — caller treats them as 0 hours.
 */
export async function getWorkerAvailability(
  workerId: string,
  from: Date,
  to: Date
): Promise<WorkerAvailabilityRow[]> {
  const rows = await prisma.workerAvailability.findMany({
    where: {
      workerId,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    workerId: r.workerId,
    date: r.date,
    availableHours: r.availableHours,
  }))
}

/**
 * Upserts a worker's available hours for a given date.
 * If hours <= 0 the record is deleted (treat as no entry).
 */
export async function setWorkerAvailability(
  workerId: string,
  date: Date,
  availableHours: number
) {
  if (availableHours < 0) availableHours = 0

  if (availableHours === 0) {
    // Clean up zero-hour entries
    await prisma.workerAvailability.deleteMany({
      where: { workerId, date },
    })
    return null
  }

  return prisma.workerAvailability.upsert({
    where: { workerId_date: { workerId, date } },
    update: { availableHours },
    create: { workerId, date, availableHours },
  })
}

// ── Default Weekly Availability ───────────────────────────────────────────────

export type DefaultAvailabilityRow = {
  dayOfWeek: number // 0 = Sunday … 6 = Saturday
  hours: number
}

/** Returns default hours for all 7 days. Missing days default to 0. */
export async function getDefaultAvailability(workerId: string): Promise<DefaultAvailabilityRow[]> {
  const rows = await prisma.workerDefaultAvailability.findMany({
    where: { workerId },
    orderBy: { dayOfWeek: "asc" },
    select: { dayOfWeek: true, hours: true },
  })
  const map = new Map(rows.map((r) => [r.dayOfWeek, r.hours]))
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    hours: map.get(i) ?? 0,
  }))
}

/** Upserts default hours for every provided day. */
export async function setDefaultAvailability(
  workerId: string,
  data: DefaultAvailabilityRow[]
) {
  await prisma.$transaction(
    data.map(({ dayOfWeek, hours }) =>
      prisma.workerDefaultAvailability.upsert({
        where: { workerId_dayOfWeek: { workerId, dayOfWeek } },
        update: { hours },
        create: { workerId, dayOfWeek, hours },
      })
    )
  )
}

/**
 * Generates WorkerAvailability records from today through +2 months using
 * the worker's default weekly schedule. Existing records in the range are
 * replaced atomically with a deleteMany + createMany (2 DB ops, no timeout).
 * Returns the number of days written.
 */
export async function applyDefaultAvailability(workerId: string): Promise<number> {
  const defaults = await getDefaultAvailability(workerId)
  const hoursMap = new Map(defaults.map((d) => [d.dayOfWeek, d.hours]))

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 2)

  // Build all records up-front (includes 0-hour days to make schedule explicit)
  const records: { workerId: string; date: Date; availableHours: number }[] = []
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    records.push({
      workerId,
      date: new Date(d),
      availableHours: hoursMap.get(d.getDay()) ?? 0,
    })
  }

  // Delete existing range, then bulk-insert — just 2 DB operations
  await prisma.$transaction([
    prisma.workerAvailability.deleteMany({
      where: { workerId, date: { gte: start, lte: end } },
    }),
    prisma.workerAvailability.createMany({
      data: records,
    }),
  ])

  return records.length
}
