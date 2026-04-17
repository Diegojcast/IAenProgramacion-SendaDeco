/**
 * GET  /api/admin/homepage — returns hero image metadata (no binary)
 * POST /api/admin/homepage — uploads a new hero image and/or updates heroAlt
 * DELETE /api/admin/homepage — clears the hero image
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { extractAndProcessImage } from "@/lib/image-processing"

export async function GET() {
  const settings = await prisma.homepageSettings.findUnique({
    where: { id: "main" },
    select: { heroImageMime: true, heroAlt: true, updatedAt: true },
  })

  return NextResponse.json({
    hasHeroImage: !!settings?.heroImageMime,
    heroAlt: settings?.heroAlt ?? "",
    updatedAt: settings?.updatedAt ?? null,
  })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const heroAlt = (formData.get("heroAlt") as string | null) ?? ""

  // If a file was provided, process it
  const hasFile = formData.get("heroImage") instanceof File
  if (hasFile) {
    const result = await extractAndProcessImage(formData, "heroImage")
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await prisma.homepageSettings.upsert({
      where: { id: "main" },
      update: {
        heroImageData: result.data,
        heroImageMime: result.mime,
        heroAlt,
      },
      create: {
        id: "main",
        heroImageData: result.data,
        heroImageMime: result.mime,
        heroAlt,
      },
    })

    return NextResponse.json({ ok: true, width: result.width, height: result.height })
  }

  // Alt-text-only update
  await prisma.homepageSettings.upsert({
    where: { id: "main" },
    update: { heroAlt },
    create: { id: "main", heroAlt },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await prisma.homepageSettings.upsert({
    where: { id: "main" },
    update: { heroImageData: null, heroImageMime: null },
    create: { id: "main" },
  })
  return NextResponse.json({ ok: true })
}
