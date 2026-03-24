import type { CartItem, Product } from "@/types"

/**
 * Resultado del cálculo de entrega para un producto.
 * - En stock: ventana 1–3 días (despacho inmediato).
 * - Sin stock: producción + secado (días corridos de taller).
 */
export type ProductDeliveryEstimate = {
  minDays: number
  maxDays: number
  source: "stock" | "made_to_order"
}

/**
 * Plazo por ítem según reglas de negocio.
 * stock > 0  → 1–3 días
 * stock === 0 → production_time + drying_time (mismo valor min y max)
 */
export function calculateProductDeliveryTime(product: Product): ProductDeliveryEstimate {
  if (product.stock > 0) {
    return { minDays: 1, maxDays: 3, source: "stock" }
  }
  const total = product.production_time + product.drying_time
  return { minDays: total, maxDays: total, source: "made_to_order" }
}

/**
 * El pedido completo sale cuando el ítem más lento está listo:
 * min del carrito = MAX(mínimos por producto)
 * max del carrito = MAX(máximos por producto)
 */
export function calculateCartDeliveryTime(items: CartItem[]): {
  minDays: number
  maxDays: number
} {
  if (items.length === 0) {
    return { minDays: 0, maxDays: 0 }
  }

  let cartMin = 0
  let cartMax = 0
  let first = true

  for (const item of items) {
    const d = calculateProductDeliveryTime(item)
    if (first) {
      cartMin = d.minDays
      cartMax = d.maxDays
      first = false
    } else {
      cartMin = Math.max(cartMin, d.minDays)
      cartMax = Math.max(cartMax, d.maxDays)
    }
  }

  return { minDays: cartMin, maxDays: cartMax }
}

/** Etiqueta corta para UI: "1-3", "7", etc. */
export function formatDeliveryRange(minDays: number, maxDays: number): string {
  if (minDays === 0 && maxDays === 0) return "0"
  if (minDays === maxDays) return String(minDays)
  return `${minDays}-${maxDays}`
}

/** Texto listo para tarjetas / detalle */
export function formatProductDeliveryLabel(product: Product): string {
  const d = calculateProductDeliveryTime(product)
  return formatDeliveryRange(d.minDays, d.maxDays)
}

/** Texto para resumen de carrito / checkout */
export function formatCartDeliveryLabel(items: CartItem[]): string {
  const { minDays, maxDays } = calculateCartDeliveryTime(items)
  return formatDeliveryRange(minDays, maxDays)
}
