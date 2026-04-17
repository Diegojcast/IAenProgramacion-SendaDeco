import { prisma } from "@/lib/db/prisma"
import { ensureOrderSteps } from "@/lib/repositories/order-steps"

export type AdminOrder = {
  id: string
  status: string
  total: number
  deliveryTime: string
  deliveryMethod: string
  paymentMethod: string
  nombre: string
  email: string
  telefono: string
  calle: string | null
  ciudad: string | null
  codigoPostal: string | null
  createdAt: Date
  items: {
    id: string
    quantity: number
    price: number
    color: string
    productName: string
  }[]
  workers?: { id: string; firstName: string; lastName: string }[]
  orderSteps?: {
    id: string
    name: string
    order: number
    durationHours: number
    requiredCategoryId: string | null
    completed: boolean
    completedAt: Date | null
  }[]
}

export async function adminGetOrders(): Promise<AdminOrder[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      workers: { include: { worker: { select: { id: true, firstName: true, lastName: true } } } },
    },
  }).then((rows) =>
    rows.map((o) => ({
      ...o,
      workers: o.workers.map((ow) => ow.worker),
    }))
  ) as Promise<AdminOrder[]>
}

export async function adminGetOrderById(id: string): Promise<AdminOrder | null> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      workers: { include: { worker: { select: { id: true, firstName: true, lastName: true } } } },
      orderSteps: { orderBy: { order: "asc" } },
    },
  })
  if (!o) return null

  // Backfill steps for orders created before this feature existed
  const productIds = o.items.map((item) => item.productId)
  const orderSteps = await ensureOrderSteps(o.id, productIds)

  return {
    ...o,
    workers: o.workers.map((ow) => ow.worker),
    orderSteps,
  } as AdminOrder
}

export async function adminUpdateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status } })
}

/** Replace all worker assignments for an order atomically. */
export async function assignWorkersToOrder(orderId: string, workerIds: string[]) {
  await prisma.$transaction([
    prisma.orderWorker.deleteMany({ where: { orderId } }),
    prisma.orderWorker.createMany({
      data: workerIds.map((workerId) => ({ orderId, workerId })),
    }),
  ])
}

/** Cancel an order and remove all worker assignments. */
export async function cancelOrder(orderId: string) {
  await prisma.$transaction([
    prisma.orderWorker.deleteMany({ where: { orderId } }),
    prisma.order.update({ where: { id: orderId }, data: { status: "cancelado" } }),
  ])
}

/** Get orders assigned to a specific worker (excludes cancelled). */
export async function getOrdersByWorker(workerId: string): Promise<AdminOrder[]> {
  const rows = await prisma.orderWorker.findMany({
    where: {
      workerId,
      order: { status: { not: "cancelado" } },
    },
    include: {
      order: {
        include: {
          items: true,
          workers: { include: { worker: { select: { id: true, firstName: true, lastName: true } } } },
          orderSteps: { orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  })

  // Backfill steps for any order that doesn't have them yet
  const orders = await Promise.all(
    rows.map(async (ow) => {
      const productIds = ow.order.items.map((item) => item.productId)
      const orderSteps = await ensureOrderSteps(ow.order.id, productIds)
      return {
        ...ow.order,
        workers: ow.order.workers.map((w) => w.worker),
        orderSteps,
      }
    })
  )
  return orders as AdminOrder[]
}

// ── Dashboard metrics ──────────────────────────────────────────────────────

export async function adminGetDashboardMetrics() {
  const [totalProducts, pendingOrders, lowStockMaterials, totalOrders] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { status: "pendiente" } }),
      prisma.material.count({ where: { stock: { lt: 5 } } }),
      prisma.order.count(),
    ])

  return { totalProducts, pendingOrders, lowStockMaterials, totalOrders }
}
