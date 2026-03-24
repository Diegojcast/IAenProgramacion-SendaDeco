/** Formato de moneda para precios en ARS (es-AR). */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`
}
