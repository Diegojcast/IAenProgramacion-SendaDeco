import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetWorkers, adminCreateWorker } from "@/lib/repositories/admin/workers"

export async function GET() {
  const workers = await adminGetWorkers()
  return NextResponse.json({ workers })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const worker = await adminCreateWorker(data)
  return NextResponse.json({ worker }, { status: 201 })
}
