/**
 * PUT /api/admin/products/[id]/images/reorder
 * Reorders product images.
 * Body: { order: string[] }  — array of imageId in desired order
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
