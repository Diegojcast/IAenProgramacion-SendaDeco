/**
 * Capa admin: acceso a órdenes vía repositorio de base de datos.
 */

import type { Order } from "@/types"
import { createOrder, listOrders } from "@/lib/repositories/orders"

export async function registerOrder(order: Order): Promise<Order> {
  return createOrder(order)
}

export async function listOrdersFromDB(): Promise<readonly Order[]> {
  return listOrders()
}
