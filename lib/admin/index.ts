/**
 * Capa admin (MVP): estructura para órdenes y catálogo sin UI aún.
 * - En memoria / mock hasta conectar persistencia.
 */

import type { Order } from "@/types"

/** Cola mock de órdenes (reemplazar por base de datos). */
const orders: Order[] = []

export function registerOrderMock(order: Order): void {
  orders.unshift(order)
}

export function listOrdersMock(): readonly Order[] {
  return orders
}
