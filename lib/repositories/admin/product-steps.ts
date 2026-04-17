import { prisma } from "@/lib/db/prisma"

// ── Types ────────────────────────────────────────────────────────────────────

export type ProductStepRow = {
  id: string
  productId: string
  name: string
  order: number
  durationHours: number
  requiredCategoryId: string | null
  requiredCategory: { id: string; name: string } | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Total production hours for a product: sum of all step durations.
 * Returns 0 if no steps are defined.
 */
export function totalStepHours(steps: Pick<ProductStepRow, "durationHours">[]): number {
  return steps.reduce((sum, s) => sum + s.durationHours, 0)
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getProductSteps(productId: string): Promise<ProductStepRow[]> {
  const rows = await prisma.productStep.findMany({
    where: { productId },
    orderBy: { order: "asc" },
    include: {
      requiredCategory: { select: { id: true, name: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    name: r.name,
    order: r.order,
    durationHours: r.durationHours,
    requiredCategoryId: r.requiredCategoryId,
    requiredCategory: r.requiredCategory,
  }))
}

export async function createProductStep(data: {
  productId: string
  name: string
  order: number
  durationHours: number
  requiredCategoryId?: string | null
}): Promise<ProductStepRow> {
  const r = await prisma.productStep.create({
    data: {
      productId: data.productId,
      name: data.name,
      order: data.order,
      durationHours: Math.max(0, data.durationHours),
      requiredCategoryId: data.requiredCategoryId ?? null,
    },
    include: { requiredCategory: { select: { id: true, name: true } } },
  })
  return {
    id: r.id,
    productId: r.productId,
    name: r.name,
    order: r.order,
    durationHours: r.durationHours,
    requiredCategoryId: r.requiredCategoryId,
    requiredCategory: r.requiredCategory,
  }
}

export async function updateProductStep(
  id: string,
  data: {
    name?: string
    order?: number
    durationHours?: number
    requiredCategoryId?: string | null
  }
): Promise<ProductStepRow> {
  const r = await prisma.productStep.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.durationHours !== undefined && {
        durationHours: Math.max(0, data.durationHours),
      }),
      ...("requiredCategoryId" in data && { requiredCategoryId: data.requiredCategoryId }),
    },
    include: { requiredCategory: { select: { id: true, name: true } } },
  })
  return {
    id: r.id,
    productId: r.productId,
    name: r.name,
    order: r.order,
    durationHours: r.durationHours,
    requiredCategoryId: r.requiredCategoryId,
    requiredCategory: r.requiredCategory,
  }
}

export async function deleteProductStep(id: string): Promise<void> {
  await prisma.productStep.delete({ where: { id } })
}

/**
 * Replace all steps for a product atomically.
 * Used when saving the full product form.
 */
export async function replaceProductSteps(
  productId: string,
  steps: { name: string; order: number; durationHours: number; requiredCategoryId?: string | null }[]
): Promise<void> {
  await prisma.$transaction([
    prisma.productStep.deleteMany({ where: { productId } }),
    prisma.productStep.createMany({
      data: steps.map((s) => ({
        productId,
        name: s.name,
        order: s.order,
        durationHours: Math.max(0, s.durationHours),
        requiredCategoryId: s.requiredCategoryId ?? null,
      })),
    }),
  ])
}
