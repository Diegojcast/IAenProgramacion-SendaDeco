import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  adminUpdateOrderStatus,
  assignWorkersToOrder,
  cancelOrder,
} from "@/lib/repositories/admin/orders"
import { prisma } from "@/lib/db/prisma"
import { isValidAdminTransition, isValidOrderTransition } from "@/lib/order-workflow"
import { auth } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // @ts-expect-error – extended session
  const isAdmin = session?.user?.role === "admin"

  const { id } = await params
  const body = await request.json()

  if (body.action === "cancel") {
    await cancelOrder(id)
    return NextResponse.json({ ok: true })
  }

  if (body.action === "assign-workers") {
    const workerIds: string[] = body.workerIds ?? []
    await assignWorkersToOrder(id, workerIds)
    return NextResponse.json({ ok: true })
  }

  if (body.status) {
    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } })
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Admins may move freely; workers are restricted to the forward chain
    const allowed = isAdmin
      ? isValidAdminTransition(current.status, body.status)
      : isValidOrderTransition(current.status, body.status)

    if (!allowed) {
      const reason = isAdmin ? "Transición no permitida para admins" : "Solo se puede avanzar al siguiente estado"
      console.warn(`[orders] rejected transition: ${current.status} → ${body.status} (order ${id}, admin=${isAdmin})`)
      return NextResponse.json({ error: reason }, { status: 400 })
    }

    const order = await adminUpdateOrderStatus(id, body.status)
    return NextResponse.json({ order })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
