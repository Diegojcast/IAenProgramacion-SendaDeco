/**
 * DELETE /api/admin/products/[id]/images/[imageId]
 * Deletes a single product image.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params

  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { productId: true },
  })

  if (!img || img.productId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  return NextResponse.json({ ok: true })
}
