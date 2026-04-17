import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createOrder, listOrders } from "@/lib/repositories/orders"
import type { Order } from "@/types"

/**
 * POST /api/orders — persists a new order.
 * Body: the full Order object assembled by the checkout form.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Order

  // Revive Date that arrives as a string from JSON
  const order: Order = {
    ...body,
    createdAt: new Date(body.createdAt),
  }

  const created = await createOrder(order)
  return NextResponse.json({ order: created }, { status: 201 })
}

/**
 * GET /api/orders — returns all orders (admin use only; add auth before going live).
 */
export async function GET() {
  const orders = await listOrders()
  return NextResponse.json({ orders })
}
