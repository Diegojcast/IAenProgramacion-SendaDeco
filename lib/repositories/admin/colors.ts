import { prisma } from "@/lib/db/prisma"

export type AdminColor = { id: string; name: string; slug: string; hex: string | null; _count: { productColors: number } }

export async function adminGetColors(): Promise<AdminColor[]> {
  return prisma.color.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { productColors: true } } },
  }) as Promise<AdminColor[]>
}

export async function adminCreateColor(data: { name: string; slug: string; hex?: string }) {
  return prisma.color.create({ data })
}

export async function adminUpdateColor(id: string, data: { name: string; slug: string; hex?: string }) {
  return prisma.color.update({ where: { id }, data })
}

export async function adminDeleteColor(id: string) {
  return prisma.color.delete({ where: { id } })
}
