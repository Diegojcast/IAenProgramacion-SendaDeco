/**
 * DELETE /api/admin/products/[id]/images/[imageId]
 * Deletes a single product image.
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
