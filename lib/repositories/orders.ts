import { prisma } from "@/lib/db/prisma"
import type { Order, OrderStatus, CartItem } from "@/types"
import { createOrderStepsFromProducts } from "@/lib/repositories/order-steps"

// ── Mappers ───────────────────────────────────────────────────────────────────

type DbOrderWithItems = Awaited<ReturnType<typeof prisma.order.findUnique>> & {
  items: Array<{
    id: string
    orderId: string
    productId: string
    quantity: number
    price: number
    color: string
    productName: string
    product: {
      id: string
      name: string
      price: number
      production_time: number
      drying_time: number
      description: string
    }
  }>
}

function toOrder(row: NonNullable<DbOrderWithItems>): Order {
  const items: CartItem[] = row.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    categories: [], // not needed for order display
    price: item.price,
    production_time: item.product.production_time,
    drying_time: item.product.drying_time,
    variants: [],
    selectedColor: item.color,
    description: item.product.description,
    featured: false,
    imageIds: [],
    quantity: item.quantity,
  }))

  return {
    id: row.id,
    items,
    customer: {
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      calle: row.calle ?? "",
      ciudad: row.ciudad ?? "",
      codigoPostal: row.codigoPostal ?? "",
    },
    deliveryMethod: row.deliveryMethod as Order["deliveryMethod"],
    paymentMethod: row.paymentMethod as Order["paymentMethod"],
    status: row.status as OrderStatus,
    total: row.total,
    deliveryTime: row.deliveryTime,
    createdAt: row.createdAt,
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createOrder(order: Order): Promise<Order> {
  const created = await prisma.order.create({
    data: {
      id: order.id,
      status: order.status,
      total: order.total,
      deliveryTime: order.deliveryTime,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      nombre: order.customer.nombre,
      email: order.customer.email,
      telefono: order.customer.telefono,
      calle: order.customer.calle || null,
      ciudad: order.customer.ciudad || null,
      codigoPostal: order.customer.codigoPostal || null,
      items: {
        create: order.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          color: item.selectedColor,
          productName: item.name,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  })

  // Snapshot production steps from every product in this order, one step per unit
  const orderItems = created.items.map((item) => ({ productId: item.productId, quantity: item.quantity, itemId: item.id }))
  await createOrderStepsFromProducts(created.id, orderItems)

  return toOrder(created as NonNullable<DbOrderWithItems>)
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function listOrders(): Promise<readonly Order[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  })
  return rows.map((r) => toOrder(r as NonNullable<DbOrderWithItems>))
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
  return row ? toOrder(row as NonNullable<DbOrderWithItems>) : null
}
