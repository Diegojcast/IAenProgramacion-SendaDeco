import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminUpdateCategory, adminDeleteCategory } from "@/lib/repositories/admin/categories"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const data = await request.json()
  const category = await adminUpdateCategory(id, data)
  return NextResponse.json({ category })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await adminDeleteCategory(id)
  return NextResponse.json({ ok: true })
}
