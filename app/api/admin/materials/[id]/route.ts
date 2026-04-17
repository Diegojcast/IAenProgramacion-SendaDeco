import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminUpdateMaterial, adminDeleteMaterial } from "@/lib/repositories/admin/materials"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const data = await request.json()
  const material = await adminUpdateMaterial(id, data)
  return NextResponse.json({ material })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await adminDeleteMaterial(id)
  return NextResponse.json({ ok: true })
}
