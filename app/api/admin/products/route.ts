import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminGetProducts, adminCreateProduct } from "@/lib/repositories/admin/products"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const products = await adminGetProducts()
  return NextResponse.json({ products })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await request.json()
  const product = await adminCreateProduct(data)
  return NextResponse.json({ product }, { status: 201 })
}
