import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetColors, adminCreateColor } from "@/lib/repositories/admin/colors"

export async function GET() {
  const colors = await adminGetColors()
  return NextResponse.json({ colors })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const color = await adminCreateColor(data)
  return NextResponse.json({ color }, { status: 201 })
}
