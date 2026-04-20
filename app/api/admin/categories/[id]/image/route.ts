/**
 * POST /api/admin/categories/[id]/image
 * Uploads and stores a binary category image.
 * Accepts multipart/form-data with field "image".
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { extractAndProcessImage } from "@/lib/image-processing"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const formData = await req.formData()
  const result = await extractAndProcessImage(formData, "image")

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await prisma.category.update({
    where: { id },
    data: {
      imageData: result.data,
      imageMime: result.mime,
      imageWidth: result.width,
      imageHeight: result.height,
    },
  })

  return NextResponse.json({
    ok: true,
    width: result.width,
    height: result.height,
    processedSize: result.processedSize,
  })
}

/**
 * DELETE /api/admin/categories/[id]/image
 * Removes the binary image from a category.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params

  await prisma.category.update({
    where: { id },
    data: { imageData: null, imageMime: null, imageWidth: null, imageHeight: null },
  })

  return NextResponse.json({ ok: true })
}
