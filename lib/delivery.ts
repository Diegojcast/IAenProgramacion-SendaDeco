import type { CartItem, FulfillmentSnapshot, Product } from "@/types"

/**
 * Si hay pedido sin insumos y el integrador no informa días de espera,
 * usamos 0 para no inventar plazos (la UI/API deberá enriquecer el snapshot).
 */
const DEFAULT_MATERIAL_LEAD_WHEN_UNAVAILABLE = 0

/**
 * Resultado del cálculo de entrega para un producto.
 * - En stock: ventana 1–3 días (despacho inmediato).
 * - Sin stock: producción + secado (+ espera de materiales cuando corresponda).
 */
export type ProductDeliveryEstimate = {
  minDays: number
  maxDays: number
  source: "stock" | "made_to_order"
  /** Días sumados por cola de materiales en el camino made-to-order (auditoría / UI). */
  materialDelayDays?: number
}

export type FulfillmentResolver = (item: CartItem) => Partial<FulfillmentSnapshot> | undefined

/**
 * Stock total del producto: suma de stock de todas las variantes de color.
 */
function totalVariantStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0)
}

/**
 * Combina el catálogo con un snapshot parcial (p. ej. respuesta de un servicio de stock).
 * Punto único para enchufar validación de materiales sin tocar la UI.
 */
export function resolveFulfillmentSnapshot(
  product: Product,
  partial?: Partial<FulfillmentSnapshot>
): FulfillmentSnapshot {
  return {
    finishedStock: partial?.finishedStock ?? totalVariantStock(product),
    materialsAvailable: partial?.materialsAvailable ?? true,
    materialLeadDays: Math.max(0, partial?.materialLeadDays ?? 0),
    requestedQuantity: partial?.requestedQuantity,
  }
}

function materialWaitDays(snapshot: FulfillmentSnapshot): number {
  if (snapshot.materialsAvailable) {
    return snapshot.materialLeadDays
  }
  return Math.max(snapshot.materialLeadDays, DEFAULT_MATERIAL_LEAD_WHEN_UNAVAILABLE)
}

/**
 * Plazo por ítem según reglas de negocio + snapshot de cumplimiento.
 *
 * - Stock terminado (`finishedStock` > 0): 1–3 días (insumos no afectan piezas ya hechas).
 * - Sin stock terminado: producción + secado + espera de materiales cuando aplique.
 *
 * production_time y drying_time están en HORAS; se convierten a días redondeando hacia arriba.
 */
export function calculateProductDeliveryTime(
  product: Product,
  partialSnapshot?: Partial<FulfillmentSnapshot>
): ProductDeliveryEstimate {
  const s = resolveFulfillmentSnapshot(product, partialSnapshot)

  if (s.finishedStock > 0) {
    return { minDays: 1, maxDays: 3, source: "stock", materialDelayDays: 0 }
  }

  const pipelineHours = product.production_time + product.drying_time
  const pipelineDays = Math.ceil(pipelineHours / 24)
  const materialDelay = materialWaitDays(s)
  const total = pipelineDays + materialDelay

  return {
    minDays: total,
    maxDays: total,
    source: "made_to_order",
    materialDelayDays: materialDelay,
  }
}

/**
 * El pedido completo sale cuando el ítem más lento está listo:
 * min del carrito = MAX(mínimos por producto)
 * max del carrito = MAX(máximos por producto)
 *
 * `resolver` permite inyectar por línea el resultado futuro de stock de materiales / ATP.
 */
export function calculateCartDeliveryTime(
  items: CartItem[],
  resolver?: FulfillmentResolver
): {
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
    const linePartial = resolver?.(item)
    const partial: Partial<FulfillmentSnapshot> = {
      ...linePartial,
      requestedQuantity: linePartial?.requestedQuantity ?? item.quantity,
    }
    const d = calculateProductDeliveryTime(item, partial)
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
export function formatProductDeliveryLabel(
  product: Product,
  partialSnapshot?: Partial<FulfillmentSnapshot>
): string {
  const d = calculateProductDeliveryTime(product, partialSnapshot)
  return formatDeliveryRange(d.minDays, d.maxDays)
}

/** Texto para resumen de carrito / checkout */
export function formatCartDeliveryLabel(items: CartItem[], resolver?: FulfillmentResolver): string {
  const { minDays, maxDays } = calculateCartDeliveryTime(items, resolver)
  return formatDeliveryRange(minDays, maxDays)
}

