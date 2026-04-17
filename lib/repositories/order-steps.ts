import { prisma } from "@/lib/db/prisma"

export type OrderStepRow = {
  id: string
  orderId: string
  name: string
  order: number
  durationHours: number
  requiredCategoryId: string | null
  completed: boolean
  completedAt: Date | null
}

/** Fetch all steps for an order, sorted by order index. */
export async function getOrderSteps(orderId: string): Promise<OrderStepRow[]> {
  return prisma.orderStep.findMany({
    where: { orderId },
    orderBy: { order: "asc" },
  })
}

/**
 * Snapshot ProductSteps for every unique product in an order.
 * Called once when the order is created.
 * If a product has no steps, nothing is inserted for it.
 */
export async function createOrderStepsFromProducts(
  orderId: string,
  productIds: string[]
): Promise<void> {
  // Deduplicate product IDs
  const uniqueProductIds = [...new Set(productIds)]

  // Fetch all relevant ProductSteps
  const productSteps = await prisma.productStep.findMany({
    where: { productId: { in: uniqueProductIds } },
    orderBy: [{ productId: "asc" }, { order: "asc" }],
  })

  if (productSteps.length === 0) return

  // Re-number steps globally across all products (preserving per-product order)
  const data = productSteps.map((s, i) => ({
    orderId,
    name: s.name,
    order: i,
    durationHours: s.durationHours,
    requiredCategoryId: s.requiredCategoryId,
    completed: false,
  }))

  await prisma.orderStep.createMany({ data })
}

/** Toggle the completed state of a single step. Returns the updated row. */
export async function toggleOrderStep(
  stepId: string,
  completed: boolean
): Promise<OrderStepRow> {
  return prisma.orderStep.update({
    where: { id: stepId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  })
}

/**
 * Lazy backfill: if an order has no OrderSteps yet, generate them now from
 * the products in its items. Safe to call on every order load — it's a no-op
 * when steps already exist.
 * Returns the (possibly just-created) steps sorted by order index.
 */
export async function ensureOrderSteps(
  orderId: string,
  itemProductIds: string[]
): Promise<OrderStepRow[]> {
  const existing = await prisma.orderStep.count({ where: { orderId } })
  if (existing > 0) {
    return getOrderSteps(orderId)
  }

  // No steps yet — backfill from current product definitions
  await createOrderStepsFromProducts(orderId, itemProductIds)
  return getOrderSteps(orderId)
}
