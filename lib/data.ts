/**
 * Punto de entrada de datos y dominio (compatibilidad con imports @/lib/data).
 * Tipos → /types · Mock → /data · Cálculos → /lib/delivery.ts
 */

export type {
  Product,
  CartItem,
  Order,
  ProductCategory,
  ProductColorId,
  OrderStatus,
} from "@/types"

export { products, categories, colorOptions, colors } from "@/data"

export {
  calculateProductDeliveryTime,
  calculateCartDeliveryTime,
  formatDeliveryRange,
  formatProductDeliveryLabel,
  formatCartDeliveryLabel,
} from "./delivery"

export { formatPrice } from "./format"
