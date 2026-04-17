/**
 * GET /api/images/homepage/hero
 * Serves the homepage hero image from the database.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=300"

export async function GET() {
  const settings = await prisma.homepageSettings.findUnique({
    where: { id: "main" },
    select: { heroImageData: true, heroImageMime: true },
  })

  if (!settings?.heroImageData || !settings.heroImageMime) {
    return NextResponse.json({ error: "No hero image" }, { status: 404 })
  }

  return new NextResponse(settings.heroImageData, {
    headers: {
      "Content-Type": settings.heroImageMime,
      "Cache-Control": CACHE_CONTROL,
    },
  })
}
