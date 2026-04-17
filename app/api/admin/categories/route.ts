import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminGetCategories, adminCreateCategory } from "@/lib/repositories/admin/categories"

export async function GET() {
  const categories = await adminGetCategories()
  return NextResponse.json({ categories })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const category = await adminCreateCategory(data)
  return NextResponse.json({ category }, { status: 201 })
}
