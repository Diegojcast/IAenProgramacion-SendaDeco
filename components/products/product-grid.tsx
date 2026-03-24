"use client"

import { useSearchParams } from "next/navigation"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function ProductGrid() {
  const searchParams = useSearchParams()
  
  const category = searchParams.get("category")
  const color = searchParams.get("color")

  const filteredProducts = products.filter((product) => {
    if (category && product.category !== category) return false
    if (color && product.color !== color) return false
    return true
  })

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p className="font-serif text-xl text-foreground max-w-md">
          No hay piezas con estos filtros
        </p>
        <p className="text-muted-foreground mt-4 leading-relaxed max-w-sm">
          Probá otra categoría o color, o mirá toda la colección.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
