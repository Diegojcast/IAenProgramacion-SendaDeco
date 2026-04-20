import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  adminGetProductById,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/repositories/admin/products"
import { auth } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const product = await adminGetProductById(id)
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  try {
    const data = await request.json()
    const product = await adminUpdateProduct(id, data)
    return NextResponse.json({ product })
  } catch (err) {
    console.error("[PUT /api/admin/products/[id]]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await adminDeleteProduct(id)
  return NextResponse.json({ ok: true })
}
