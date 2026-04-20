/**
 * PUT /api/admin/products/[id]/images/reorder
 * Reorders product images.
 * Body: { order: string[] }  — array of imageId in desired order
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json() as { order?: string[] }

  if (!Array.isArray(body.order)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Update sortOrder for each image in a transaction
  await prisma.$transaction(
    body.order.map((imageId: string, index: number) =>
      prisma.productImage.updateMany({
        where: { id: imageId, productId: id },
        data: { sortOrder: index },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
