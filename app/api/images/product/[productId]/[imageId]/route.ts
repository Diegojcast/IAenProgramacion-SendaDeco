/**
 * GET /api/images/product/[productId]/[imageId]
 * Serves a single ProductImage binary from the database.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  const { productId, imageId } = await params

  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { imageData: true, imageMime: true, productId: true },
  })

  if (!img || img.productId !== productId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(img.imageData, {
    headers: {
      "Content-Type": img.imageMime,
      "Cache-Control": CACHE_CONTROL,
    },
  })
}
