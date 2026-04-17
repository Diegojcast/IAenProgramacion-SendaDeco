import { prisma } from "@/lib/db/prisma"
import type { Product } from "@/types"

// Map relational Product row → app Product type
function toProduct(row: {
  id: string
  name: string
  price: number
  production_time: number
  drying_time: number
  description: string
  featured: boolean
  categories: { category: { slug: string } }[]
  colors: { stock: number; color: { slug: string } }[]
  images: { id: string; sortOrder: number }[]
  steps?: { durationHours: number }[]
}): Product {
  // If steps are defined, use their sum as production_time; fall back to legacy field.
  const production_time =
    row.steps && row.steps.length > 0
      ? row.steps.reduce((sum, s) => sum + s.durationHours, 0)
      : row.production_time

  return {
    id: row.id,
    name: row.name,
    categories: row.categories.map((c) => c.category.slug),
    price: row.price,
    production_time,
    drying_time: row.steps && row.steps.length > 0 ? 0 : row.drying_time,
    variants: row.colors.map((c) => ({ colorSlug: c.color.slug, stock: c.stock })),
    description: row.description,
    featured: row.featured,
    imageIds: row.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.id),
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string
  color?: string
}): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(filters?.category
        ? { categories: { some: { category: { slug: filters.category } } } }
        : {}),
      ...(filters?.color
        ? { colors: { some: { color: { slug: filters.color } } } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      categories: { include: { category: true } },
      colors: { include: { color: true } },
      images: { select: { id: true, sortOrder: true } },
      steps: { select: { durationHours: true } },
    },
  })
  return rows.map(toProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      colors: { include: { color: true } },
      images: { select: { id: true, sortOrder: true } },
      steps: { select: { durationHours: true } },
    },
  })
  return row ? toProduct(row) : null
}
