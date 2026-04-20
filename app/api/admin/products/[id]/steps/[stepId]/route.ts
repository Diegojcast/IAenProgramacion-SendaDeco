import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { updateProductStep, deleteProductStep } from "@/lib/repositories/admin/product-steps"

type Params = { params: Promise<{ id: string; stepId: string }> }

async function requireAdmin() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") return null
  return session
}

/** PATCH /api/admin/products/[id]/steps/[stepId] — update a single step */
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { stepId } = await params
  const body = await request.json()
  const step = await updateProductStep(stepId, {
    name: body.name,
    order: body.order,
    durationHours: body.durationHours,
    requiredCategoryId: body.requiredCategoryId,
  })
  return NextResponse.json({ step })
}

/** DELETE /api/admin/products/[id]/steps/[stepId] — delete a single step */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { stepId } = await params
  await deleteProductStep(stepId)
  return NextResponse.json({ ok: true })
}
