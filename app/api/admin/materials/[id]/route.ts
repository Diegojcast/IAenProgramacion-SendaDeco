import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminUpdateMaterial, adminDeleteMaterial } from "@/lib/repositories/admin/materials"

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
  const material = await adminUpdateMaterial(id, data)
  return NextResponse.json({ material })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await adminDeleteMaterial(id)
  return NextResponse.json({ ok: true })
}
