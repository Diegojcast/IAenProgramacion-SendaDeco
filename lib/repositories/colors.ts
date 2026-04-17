import { prisma } from "@/lib/db/prisma"

export type ColorRow = {
  id: string
  name: string
  slug: string
  hex: string | null
}

export async function getColors(): Promise<ColorRow[]> {
  return prisma.color.findMany({ orderBy: { name: "asc" } })
}
