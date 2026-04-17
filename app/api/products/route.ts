import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getProducts } from "@/lib/repositories/products"

/**
 * GET /api/products — returns the product catalogue from the database.
 * Supports optional ?category= and ?color= query params.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get("category") ?? undefined
  const color = searchParams.get("color") ?? undefined

  const products = await getProducts({ category, color })
  return NextResponse.json({ products })
}
