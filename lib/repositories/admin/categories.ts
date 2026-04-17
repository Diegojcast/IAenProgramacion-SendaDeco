import { prisma } from "@/lib/db/prisma"

export type AdminCategory = {
  id: string
  name: string
  slug: string
  image: string | null
  imageData: Buffer | null
  enabled: boolean
  _count: { products: number }
}

export async function adminGetCategories(): Promise<AdminCategory[]> {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      imageData: true,
      enabled: true,
      _count: { select: { products: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image: r.image,
    imageData: r.imageData as Buffer | null,
    enabled: r.enabled,
    _count: { products: r._count.products },
  }))
}

export async function adminCreateCategory(data: { name: string; slug: string; image?: string; enabled?: boolean }) {
  return prisma.category.create({ data })
}

export async function adminUpdateCategory(id: string, data: { name: string; slug: string; image?: string; enabled?: boolean }) {
  return prisma.category.update({ where: { id }, data })
}

export async function adminDeleteCategory(id: string) {
  return prisma.category.delete({ where: { id } })
}
