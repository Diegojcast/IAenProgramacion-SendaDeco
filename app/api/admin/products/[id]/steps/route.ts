import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import {
  getProductSteps,
  createProductStep,
  updateProductStep,
  deleteProductStep,
  replaceProductSteps,
} from "@/lib/repositories/admin/product-steps"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

/** GET /api/admin/products/[id]/steps — list steps for a product */
export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const steps = await getProductSteps(id)
  return NextResponse.json({ steps })
}

/** POST /api/admin/products/[id]/steps — add a single step */
export async function POST(request: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const step = await createProductStep({
    productId: id,
    name: body.name,
    order: body.order ?? 0,
    durationHours: body.durationHours ?? 0,
    requiredCategoryId: body.requiredCategoryId ?? null,
  })
  return NextResponse.json({ step }, { status: 201 })
}

/** PUT /api/admin/products/[id]/steps — replace all steps atomically */
export async function PUT(request: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const steps: { name: string; order: number; durationHours: number; requiredCategoryId?: string | null }[] =
    body.steps ?? []
  await replaceProductSteps(id, steps)
  const updated = await getProductSteps(id)
  return NextResponse.json({ steps: updated })
}
