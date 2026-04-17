import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  adminGetProductById,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/repositories/admin/products"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const product = await adminGetProductById(id)
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const data = await request.json()
  const product = await adminUpdateProduct(id, data)
  return NextResponse.json({ product })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await adminDeleteProduct(id)
  return NextResponse.json({ ok: true })
}
