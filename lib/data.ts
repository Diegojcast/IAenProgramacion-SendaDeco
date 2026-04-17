/**
 * lib/data.ts — shared type and logic re-exports.
 * Hardcoded mock data has been removed; all data now comes from the database
 * via /lib/repositories/*.
 */

export type {
  Product,
  CartItem,
  Order,
  ProductCategory,
  ProductColorId,
  OrderStatus,
  FulfillmentSnapshot,
} from "@/types"

export {
  calculateProductDeliveryTime,
  calculateCartDeliveryTime,
  formatDeliveryRange,
  formatProductDeliveryLabel,
  formatCartDeliveryLabel,
  resolveFulfillmentSnapshot,
} from "./delivery"

export type { ProductDeliveryEstimate, FulfillmentResolver } from "./delivery"

export { formatPrice } from "./format"
