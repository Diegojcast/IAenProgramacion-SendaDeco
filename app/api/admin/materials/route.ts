import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetMaterials, adminCreateMaterial } from "@/lib/repositories/admin/materials"

export async function GET() {
  const materials = await adminGetMaterials()
  return NextResponse.json({ materials })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const material = await adminCreateMaterial(data)
  return NextResponse.json({ material }, { status: 201 })
}
