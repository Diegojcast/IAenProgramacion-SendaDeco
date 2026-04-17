import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { adminUpdateOrderStatus } from "@/lib/repositories/admin/orders"
import { prisma } from "@/lib/db/prisma"
import { isValidOrderTransition } from "@/lib/order-workflow"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  // @ts-expect-error – extended session type
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status: newStatus } = body

  const current = await prisma.order.findUnique({ where: { id }, select: { status: true } })
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (!isValidOrderTransition(current.status, newStatus)) {
    console.warn(`[worker/orders] invalid transition attempt: ${current.status} → ${newStatus} (order ${id})`)
    return NextResponse.json({ error: "Transición no permitida" }, { status: 400 })
  }

  const order = await adminUpdateOrderStatus(id, newStatus)
  return NextResponse.json({ order })
}
