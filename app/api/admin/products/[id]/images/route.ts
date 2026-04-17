/**
 * POST /api/admin/products/[id]/images
 * Upload one or more images for a product (max 10 total).
 * Accepts multipart/form-data with one or more "images" fields.
 *
 * GET /api/admin/products/[id]/images
 * Returns metadata for all images of a product (no binary).
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { extractAndProcessImage } from "@/lib/image-processing"

export const dynamic = "force-dynamic"

const MAX_IMAGES = 10

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    select: { id: true, sortOrder: true, imageMime: true, imageWidth: true, imageHeight: true, createdAt: true },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(images)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  // Check existing image count
  const existingCount = await prisma.productImage.count({ where: { productId: id } })
  if (existingCount >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `Máximo ${MAX_IMAGES} imágenes por producto.` },
      { status: 400 }
    )
  }

  const formData = await req.formData()

  // Support uploading multiple files at once
  const files = formData.getAll("images")
  if (!files.length) {
    return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 })
  }

  const slots = MAX_IMAGES - existingCount
  const toProcess = files.slice(0, slots)
  const created: { id: string; sortOrder: number }[] = []

  // Get max sortOrder to append at
  const maxOrder = await prisma.productImage.aggregate({
    where: { productId: id },
    _max: { sortOrder: true },
  })
  let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1

  for (const file of toProcess) {
    if (!(file instanceof File)) continue

    const buffer = Buffer.from(await file.arrayBuffer())
    const { processImage, validateImageFile } = await import("@/lib/image-processing")
    const validation = validateImageFile(buffer, file.type, file.name)
    if (!validation.ok) continue

    const result = await processImage(buffer)

    const img = await prisma.productImage.create({
      data: {
        productId: id,
        imageData: result.data,
        imageMime: result.mime,
        imageWidth: result.width,
        imageHeight: result.height,
        sortOrder: nextOrder++,
      },
      select: { id: true, sortOrder: true },
    })
    created.push(img)
  }

  return NextResponse.json({ ok: true, created, total: existingCount + created.length })
}
