import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  getDefaultAvailability,
  setDefaultAvailability,
  applyDefaultAvailability,
} from "@/lib/repositories/admin/workers"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workerId } = await params
  const defaults = await getDefaultAvailability(workerId)
  return NextResponse.json({ defaults })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workerId } = await params
  const { data } = await request.json()

  if (!Array.isArray(data)) {
    return NextResponse.json({ error: "data must be an array" }, { status: 400 })
  }

  await setDefaultAvailability(workerId, data)
  return NextResponse.json({ ok: true })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workerId } = await params
  const days = await applyDefaultAvailability(workerId)
  return NextResponse.json({ ok: true, days })
}
