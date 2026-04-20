import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getOrderById } from "@/lib/repositories/orders"

type Params = { params: Promise<{ orderId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { orderId } = await params

  // Basic input sanitation — reject obviously invalid IDs before hitting DB
  if (!orderId || orderId.length > 64 || !/^[a-z0-9]+$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
  }

  const order = await getOrderById(orderId)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json({ order })
}
