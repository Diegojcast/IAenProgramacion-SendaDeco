/**
 * Modelo de dominio Senda Deco.
 * Mantener tipos aquí; la lógica vive en /lib.
 */

export type ProductCategory = "macrame" | "cemento" | "velas"

/** IDs de color disponibles como variantes en catálogo */
export type ProductColorId = "crudo" | "gris" | "beige" | "terracota"

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
