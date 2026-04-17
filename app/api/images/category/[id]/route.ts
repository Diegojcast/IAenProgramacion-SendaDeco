/**
 * GET /api/images/category/[id]
 * Serves the binary image for a category from the database.
 * Falls back to a redirect to the legacy URL if no binary image is stored.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// 7-day cache for category images (rarely change)
const CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    select: { imageData: true, imageMime: true, image: true },
  })

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Prefer binary image
  if (category.imageData && category.imageMime) {
    return new NextResponse(category.imageData, {
      headers: {
        "Content-Type": category.imageMime,
        "Cache-Control": CACHE_CONTROL,
      },
    })
  }

  // Fallback: redirect to legacy URL image
  if (category.image) {
    return NextResponse.redirect(category.image)
  }

  return NextResponse.json({ error: "No image" }, { status: 404 })
}
