import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { toggleOrderStep } from "@/lib/repositories/order-steps"
import { prisma } from "@/lib/db/prisma"

/**
 * PATCH /api/orders/[orderId]/steps/[stepId]
 * Body: { completed: boolean }
 *
 * Only allowed when order.status = "en_produccion".
 * Authenticated users only (workers + admins).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; stepId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { orderId, stepId } = await params
  const { completed } = (await request.json()) as { completed: boolean }

  // Verify order exists and is in production
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status !== "en_produccion") {
    return NextResponse.json(
      { error: "Steps can only be updated when order is in production" },
      { status: 409 }
    )
  }

  const step = await toggleOrderStep(stepId, completed)
  return NextResponse.json({ step })
}
