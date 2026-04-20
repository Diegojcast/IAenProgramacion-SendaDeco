import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createOrder, listOrders } from "@/lib/repositories/orders"
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation"
import { sendAdminOrderNotification } from "@/lib/email/admin-order-notification"
import { auth } from "@/lib/auth"
import type { Order } from "@/types"

/**
 * POST /api/orders — persists a new order.
 * Body: the full Order object assembled by the checkout form.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Order

  // Basic payload sanitation
  if (!body?.customer?.email || !body?.items?.length) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 })
  }

  // Revive Date that arrives as a string from JSON
  const order: Order = {
    ...body,
    createdAt: new Date(body.createdAt),
  }

  const created = await createOrder(order)

  // Fire-and-forget — neither email blocks the 201 response
  sendOrderConfirmationEmail(created).catch((err) =>
    console.error("[api/orders] customer email failed:", err)
  )
  sendAdminOrderNotification(created).catch((err) =>
    console.error("[api/orders] admin notification failed:", err)
  )

  return NextResponse.json({ order: created }, { status: 201 })
}

/**
 * GET /api/orders — returns all orders (admin only).
 */
export async function GET() {
  const session = await auth()
  // @ts-expect-error – custom field
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const orders = await listOrders()
  return NextResponse.json({ orders })
}
