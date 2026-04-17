import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getWorkerAvailability, setWorkerAvailability } from "@/lib/repositories/admin/workers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workerId } = await params
  const { searchParams } = request.nextUrl

  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : new Date()
  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : (() => { const d = new Date(from); d.setMonth(d.getMonth() + 2); return d })()

  const availability = await getWorkerAvailability(workerId, from, to)
  return NextResponse.json({ availability })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workerId } = await params
  const { date, availableHours } = await request.json()

  if (typeof availableHours !== "number" || availableHours < 0) {
    return NextResponse.json({ error: "availableHours must be >= 0" }, { status: 400 })
  }

  const record = await setWorkerAvailability(workerId, new Date(date), availableHours)
  return NextResponse.json({ record })
}
