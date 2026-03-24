export type Product = {
  id: string
  name: string
  price: number
  category: "macrame" | "cemento" | "velas"
  color: "crudo" | "gris" | "beige" | "terracota"
  image: string
  stock: number
  production_time: number
  drying_time: number
  description: string
}

export type CartItem = Product & {
  quantity: number
}

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
  status: "pendiente" | "en_produccion" | "listo" | "enviado" | "entregado"
  total: number
  deliveryTime: string
  createdAt: Date
}

export const products: Product[] = [
  {
    id: "1",
    name: "Macramé Wall Hanging",
    price: 3200,
    category: "macrame",
    color: "crudo",
    image: "https://images.unsplash.com/photo-1622227056993-6e7f88420855?w=400&h=400&fit=crop",
    stock: 3,
    production_time: 5,
    drying_time: 0,
    description: "Hermoso colgante de pared tejido a mano con algodón natural. Perfecto para dar calidez a cualquier espacio."
  },
  {
    id: "2",
    name: "Cerando Cemento",
    price: 3500,
    category: "cemento",
    color: "gris",
    image: "https://images.unsplash.com/photo-1602028279679-aba5b4e2c75d?w=400&h=400&fit=crop",
    stock: 5,
    production_time: 3,
    drying_time: 2,
    description: "Maceta de cemento artesanal con acabado suave. Ideal para suculentas y cactus."
  },
  {
    id: "3",
    name: "Cerando Planstor",
    price: 3200,
    category: "cemento",
    color: "beige",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
    stock: 0,
    production_time: 3,
    drying_time: 2,
    description: "Macetero de cemento con diseño minimalista. Acabado natural que combina con cualquier decoración."
  },
  {
    id: "4",
    name: "Velitas Tejidos",
    price: 3200,
    category: "velas",
    color: "crudo",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400&h=400&fit=crop",
    stock: 10,
    production_time: 2,
    drying_time: 1,
    description: "Set de velas aromáticas de soja con aroma a vainilla. Hechas a mano con cera 100% natural."
  },
  {
    id: "5",
    name: "Espejo Tejido Luna",
    price: 3200,
    category: "macrame",
    color: "crudo",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop",
    stock: 2,
    production_time: 4,
    drying_time: 0,
    description: "Espejo decorativo con marco de macramé tejido a mano. Diseño único inspirado en la luna."
  },
  {
    id: "6",
    name: "Cemento Textura",
    price: 3200,
    category: "cemento",
    color: "terracota",
    image: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=400&h=400&fit=crop",
    stock: 0,
    production_time: 4,
    drying_time: 3,
    description: "Maceta con textura especial y acabado terracota. Pieza única hecha a mano."
  },
  {
    id: "7",
    name: "Velmes Tejidos",
    price: 3200,
    category: "velas",
    color: "beige",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop",
    stock: 8,
    production_time: 2,
    drying_time: 1,
    description: "Velas decorativas en tonos neutros. Perfectas para crear ambientes acogedores."
  },
  
  {
    id: "10",
    name: "Vela Soja Lavanda",
    price: 2400,
    category: "velas",
    color: "crudo",
    image: "https://images.unsplash.com/photo-1608181831688-ba943493b24e?w=400&h=400&fit=crop",
    stock: 12,
    production_time: 2,
    drying_time: 1,
    description: "Vela de soja con aroma a lavanda. Aroma relajante perfecto para el hogar."
  },
  {
    id: "11",
    name: "Florero Cemento",
    price: 1800,
    category: "cemento",
    color: "gris",
    image: "https://images.unsplash.com/photo-1612198273689-b437f53152ca?w=400&h=400&fit=crop",
    stock: 7,
    production_time: 3,
    drying_time: 2,
    description: "Florero de cemento con diseño moderno y minimalista. Perfecto para flores secas o frescas."
  },
  {
    id: "12",
    name: "Espejos Tejidos",
    price: 3200,
    category: "macrame",
    color: "crudo",
    image: "https://images.unsplash.com/photo-1582643381669-1f7a9e90e5e0?w=400&h=400&fit=crop",
    stock: 1,
    production_time: 5,
    drying_time: 0,
    description: "Set de espejos con marco de macramé. Diseño bohemio ideal para cualquier pared."
  },
  {
    id: "13",
    name: "Florero Cemento Textura",
    price: 1800,
    category: "cemento",
    color: "terracota",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop",
    stock: 0,
    production_time: 4,
    drying_time: 3,
    description: "Florero de cemento con textura única y acabado terracota. Pieza artesanal exclusiva."
  }
]

export const categories = [
  { id: "macrame", name: "Macramé", image: "https://images.unsplash.com/photo-1622227056993-6e7f88420855?w=300&h=300&fit=crop" },
  { id: "cemento", name: "Cemento", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop" },
  { id: "velas", name: "Velas", image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=300&h=300&fit=crop" }
]

export const colors = [
  { id: "crudo", name: "Crudo", hex: "#F5F0E6" },
  { id: "gris", name: "Gris", hex: "#9CA3AF" },
  { id: "beige", name: "Beige", hex: "#D4C4B0" },
  { id: "terracota", name: "Terracota", hex: "#C67B5C" }
]

export function calculateDeliveryTime(product: Product): { days: string; inStock: boolean } {
  if (product.stock > 0) {
    return { days: "1-3", inStock: true }
  }
  const totalDays = product.production_time + product.drying_time
  return { days: `${totalDays}-${totalDays + 2}`, inStock: false }
}

export function calculateCartDeliveryTime(items: CartItem[]): string {
  if (items.length === 0) return "0"
  
  let maxDays = 0
  items.forEach(item => {
    const { days, inStock } = calculateDeliveryTime(item)
    const [min] = days.split("-").map(Number)
    if (!inStock) {
      maxDays = Math.max(maxDays, min + 2)
    } else {
      maxDays = Math.max(maxDays, 3)
    }
  })
  
  return `${maxDays - 2}-${maxDays}`
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`
}
