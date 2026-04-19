import { prisma } from "@/lib/db/prisma"

export type OrderStepRow = {
  id: string
  orderId: string
  orderItemUnitId: string | null
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
 * Snapshot ProductSteps for every product in an order.
 * For each item, `quantity` OrderItemUnit rows are created, and each unit gets
 * its own independent copy of the product's steps.
 * Called once when the order is created.
 */
export async function createOrderStepsFromProducts(
  orderId: string,
  items: { productId: string; quantity: number; itemId: string }[]
): Promise<void> {
  if (items.length === 0) return

  const uniqueProductIds = [...new Set(items.map((i) => i.productId))]

  const productSteps = await prisma.productStep.findMany({
    where: { productId: { in: uniqueProductIds } },
    orderBy: [{ productId: "asc" }, { order: "asc" }],
  })

  if (productSteps.length === 0) return

  // Group template steps by product for fast lookup
  const stepsByProduct = new Map<string, typeof productSteps>()
  for (const s of productSteps) {
    if (!stepsByProduct.has(s.productId)) stepsByProduct.set(s.productId, [])
    stepsByProduct.get(s.productId)!.push(s)
  }

  await prisma.$transaction(async (tx) => {
    const stepsData: Array<{
      orderId: string
      orderItemUnitId: string
      name: string
      order: number
      durationHours: number
      requiredCategoryId: string | null
      completed: boolean
    }> = []

    let globalOrder = 0
    for (const item of items) {
      const templates = stepsByProduct.get(item.productId) ?? []
      if (templates.length === 0) continue

      for (let unitIndex = 1; unitIndex <= item.quantity; unitIndex++) {
        const unit = await tx.orderItemUnit.create({
          data: { orderItemId: item.itemId, unitIndex },
        })
        for (const tmpl of templates) {
          stepsData.push({
            orderId,
            orderItemUnitId: unit.id,
            name: tmpl.name,
            order: globalOrder++,
            durationHours: tmpl.durationHours,
            requiredCategoryId: tmpl.requiredCategoryId,
            completed: false,
          })
        }
      }
    }

    if (stepsData.length > 0) {
      await tx.orderStep.createMany({ data: stepsData })
    }
  })
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
 * Lazy backfill: if an order has no OrderSteps yet, generate them now.
 * Safe to call on every order load â€” no-op when steps already exist.
 */
export async function ensureOrderSteps(
  orderId: string,
  items: { productId: string; quantity: number; itemId: string }[]
): Promise<OrderStepRow[]> {
  const existing = await prisma.orderStep.count({ where: { orderId } })
  if (existing > 0) {
    return getOrderSteps(orderId)
  }

  await createOrderStepsFromProducts(orderId, items)
  return getOrderSteps(orderId)
}

