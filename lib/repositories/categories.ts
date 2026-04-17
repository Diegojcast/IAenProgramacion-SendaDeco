import { prisma } from "@/lib/db/prisma"

export type CategoryRow = {
  id: string
  name: string
  slug: string
  image: string | null
  hasDbImage: boolean
}

export async function getCategories(): Promise<CategoryRow[]> {
  const rows = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      imageData: true,
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image: r.image,
    hasDbImage: r.imageData !== null,
  }))
}
