import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminUpdateCategory, adminDeleteCategory } from "@/lib/repositories/admin/categories"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const data = await request.json()
  const category = await adminUpdateCategory(id, data)
  return NextResponse.json({ category })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await adminDeleteCategory(id)
  return NextResponse.json({ ok: true })
}
