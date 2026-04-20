import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminGetMaterials, adminCreateMaterial } from "@/lib/repositories/admin/materials"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const materials = await adminGetMaterials()
  return NextResponse.json({ materials })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await request.json()
  const material = await adminCreateMaterial(data)
  return NextResponse.json({ material }, { status: 201 })
}
