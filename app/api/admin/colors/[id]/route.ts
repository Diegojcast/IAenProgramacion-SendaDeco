import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminUpdateColor, adminDeleteColor } from "@/lib/repositories/admin/colors"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const data = await request.json()
  const color = await adminUpdateColor(id, data)
  return NextResponse.json({ color })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await adminDeleteColor(id)
  return NextResponse.json({ ok: true })
}
