import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminGetColors, adminCreateColor } from "@/lib/repositories/admin/colors"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const colors = await adminGetColors()
  return NextResponse.json({ colors })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await request.json()
  const color = await adminCreateColor(data)
  return NextResponse.json({ color }, { status: 201 })
}
