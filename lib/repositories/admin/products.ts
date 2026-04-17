import { prisma } from "@/lib/db/prisma"
import type { ProductStepRow } from "@/lib/repositories/admin/product-steps"

export type AdminProduct = {
  id: string
  name: string
  price: number
  active: boolean
  featured: boolean
  /** @deprecated Use steps instead. Kept for backward-compat. */
  production_time: number
  /** @deprecated Use steps instead. Kept for backward-compat. */
  drying_time: number
  description: string
  categories: { id: string; name: string }[]
  colors: { stock: number; color: { id: string; name: string; hex: string | null } }[]
  materials: { quantity: number; material: { id: string; name: string; unit: string } }[]
  images: { id: string; sortOrder: number }[]
  /** Production steps (only loaded on detail queries, not list) */
  steps?: ProductStepRow[]
}

function toAdminProduct(r: {
  id: string
  name: string
  price: number
  active: boolean
  featured: boolean
  production_time: number
  drying_time: number
  description: string
  categories: { category: { id: string; name: string } }[]
  colors: { stock: number; color: { id: string; name: string; hex: string | null } }[]
  materials: { quantity: number; material: { id: string; name: string; unit: string } }[]
  images: { id: string; sortOrder: number }[]
  steps?: { id: string; productId: string; name: string; order: number; durationHours: number; requiredCategoryId: string | null; requiredCategory: { id: string; name: string } | null }[]
}): AdminProduct {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    active: r.active,
    featured: r.featured,
    production_time: r.production_time,
    drying_time: r.drying_time,
    description: r.description,
    categories: r.categories.map((c) => ({ id: c.category.id, name: c.category.name })),
    colors: r.colors.map((c) => ({
      stock: c.stock,
      color: { id: c.color.id, name: c.color.name, hex: c.color.hex },
    })),
    materials: r.materials.map((m) => ({
      quantity: m.quantity,
      material: { id: m.material.id, name: m.material.name, unit: m.material.unit },
    })),
    images: r.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({ id: img.id, sortOrder: img.sortOrder })),
    ...(r.steps !== undefined && {
      steps: r.steps
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.id,
          productId: s.productId,
          name: s.name,
          order: s.order,
          durationHours: s.durationHours,
          requiredCategoryId: s.requiredCategoryId,
          requiredCategory: s.requiredCategory,
        })),
    }),
  }
}

export async function adminGetProducts(): Promise<AdminProduct[]> {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: true } },
      colors: { include: { color: true } },
      materials: { include: { material: true } },
      images: { select: { id: true, sortOrder: true } },
    },
  })
  return rows.map(toAdminProduct)
}

export async function adminGetProductById(id: string): Promise<AdminProduct | null> {
  const r = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      colors: { include: { color: true } },
      materials: { include: { material: true } },
      images: { select: { id: true, sortOrder: true } },
      steps: {
        include: { requiredCategory: { select: { id: true, name: true } } },
        orderBy: { order: "asc" },
      },
    },
  })
  return r ? toAdminProduct(r) : null
}

export type ProductFormData = {
  name: string
  categoryIds: string[]
  price: number
  production_time: number
  drying_time: number
  description: string
  active: boolean
  featured: boolean
  colorVariants: { colorId: string; stock: number }[]
  materials: { materialId: string; quantity: number }[]
}

export async function adminCreateProduct(data: ProductFormData) {
  const { categoryIds, colorVariants, materials, ...fields } = data
  return prisma.product.create({
    data: {
      ...fields,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      colors: { create: colorVariants.map(({ colorId, stock }) => ({ colorId, stock })) },
      materials: { create: materials.map(({ materialId, quantity }) => ({ materialId, quantity })) },
    },
  })
}

export async function adminUpdateProduct(id: string, data: ProductFormData) {
  const { categoryIds, colorVariants, materials, ...fields } = data
  return prisma.product.update({
    where: { id },
    data: {
      ...fields,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
      colors: {
        deleteMany: {},
        create: colorVariants.map(({ colorId, stock }) => ({ colorId, stock })),
      },
      materials: {
        deleteMany: {},
        create: materials.map(({ materialId, quantity }) => ({ materialId, quantity })),
      },
    },
  })
}

export async function adminDeleteProduct(id: string) {
  return prisma.product.delete({ where: { id } })
}
