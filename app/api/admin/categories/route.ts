import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminGetCategories, adminCreateCategory } from "@/lib/repositories/admin/categories"

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const categories = await adminGetCategories()
  return NextResponse.json({ categories })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await request.json()
  const category = await adminCreateCategory(data)
  return NextResponse.json({ category }, { status: 201 })
}
