import { prisma } from "@/lib/db/prisma"

export type AdminMaterial = {
  id: string
  name: string
  unit: string
  stock: number
  _count: { products: number }
}

export async function adminGetMaterials(): Promise<AdminMaterial[]> {
  return prisma.material.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  }) as Promise<AdminMaterial[]>
}

export async function adminCreateMaterial(data: { name: string; unit: string; stock: number }) {
  return prisma.material.create({ data })
}

export async function adminUpdateMaterial(id: string, data: { name: string; unit: string; stock: number }) {
  return prisma.material.update({ where: { id }, data })
}

export async function adminDeleteMaterial(id: string) {
  return prisma.material.delete({ where: { id } })
}
