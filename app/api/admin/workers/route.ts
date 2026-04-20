import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetWorkers, adminCreateWorker } from "@/lib/repositories/admin/workers"
import { auth } from "@/lib/auth"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const workers = await adminGetWorkers()
  return NextResponse.json({ workers })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await request.json()
  const worker = await adminCreateWorker(data)
  return NextResponse.json({ worker }, { status: 201 })
}
