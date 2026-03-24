/**
 * Modelo de dominio Senda Deco.
 * Mantener tipos aquí; la lógica vive en /lib.
 */

export type ProductCategory = "macrame" | "cemento" | "velas"

/** IDs de color disponibles como variantes en catálogo */
export type ProductColorId = "crudo" | "gris" | "beige" | "terracota"

/**
 * Datos de inventario / insumos para calcular plazos (hoy opcional; mañana vendrá de API o BOM).
 * Valores por defecto conservan el comportamiento actual solo con `product.stock`.
 */
export type FulfillmentSnapshot = {
  /** Unidades terminadas listas para despacho (default: `product.stock`) */
  finishedStock: number
  /**
   * Si hay insumos suficientes para fabricar (futuro: validación contra depósito / receta).
   * `false` fuerza a considerar espera de materiales antes del pipeline de taller.
   */
  materialsAvailable: boolean
  /**
   * Días extra antes de poder iniciar producción (reposición, compras, etc.).
   * Se suma al camino made-to-order; en stock terminado no aplica.
   */
  materialLeadDays: number
  /**
   * Cantidad solicitada (p. ej. línea de carrito). Reservado para validación futura
   * de materiales por unidades (BOM × cantidad).
   */
  requestedQuantity?: number
}

export type Product = {
  id: string
  name: string
  category: ProductCategory
  /** Precio en pesos argentinos */
  price: number
  stock: number
  production_time: number
  drying_time: number
  /** Variantes de color disponibles para este producto */
  colors: readonly ProductColorId[]
  /** Variante mostrada por defecto en listados / imagen principal */
  color: ProductColorId
  image: string
  description: string
}

export type CartItem = Product & {
  quantity: number
}

export type OrderStatus =
  | "pendiente"
  | "en_produccion"
  | "listo"
  | "enviado"
  | "entregado"

export type Order = {
  id: string
  items: CartItem[]
  customer: {
    nombre: string
    email: string
    telefono: string
    calle: string
    ciudad: string
    codigoPostal: string
  }
  deliveryMethod: "envio" | "retiro"
  paymentMethod: "mercadopago" | "transferencia" | "efectivo"
  status: OrderStatus
  total: number
  /** Texto legible del plazo estimado (ej. "1-3" o "7") */
  deliveryTime: string
  createdAt: Date
}
