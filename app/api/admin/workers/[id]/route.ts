import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  adminGetWorkerById,
  adminUpdateWorker,
  adminDeleteWorker,
} from "@/lib/repositories/admin/workers"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const worker = await adminGetWorkerById(id)
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ worker })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  const worker = await adminUpdateWorker(id, data)
  return NextResponse.json({ worker })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await adminDeleteWorker(id)
  return NextResponse.json({ ok: true })
}
