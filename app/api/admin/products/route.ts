import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetProducts, adminCreateProduct } from "@/lib/repositories/admin/products"

export async function GET() {
  const products = await adminGetProducts()
  return NextResponse.json({ products })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const product = await adminCreateProduct(data)
  return NextResponse.json({ product }, { status: 201 })
}
