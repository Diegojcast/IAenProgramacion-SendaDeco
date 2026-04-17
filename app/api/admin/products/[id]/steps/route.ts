import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  getProductSteps,
  createProductStep,
  updateProductStep,
  deleteProductStep,
  replaceProductSteps,
} from "@/lib/repositories/admin/product-steps"

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/products/[id]/steps — list steps for a product */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const steps = await getProductSteps(id)
  return NextResponse.json({ steps })
}

/** POST /api/admin/products/[id]/steps — add a single step */
export async function POST(request: NextRequest, { params }: Params) {
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
  const { id } = await params
  const body = await request.json()
  const steps: { name: string; order: number; durationHours: number; requiredCategoryId?: string | null }[] =
    body.steps ?? []
  await replaceProductSteps(id, steps)
  const updated = await getProductSteps(id)
  return NextResponse.json({ steps: updated })
}
