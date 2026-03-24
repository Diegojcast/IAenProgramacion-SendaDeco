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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">
          No encontramos productos con estos filtros.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta con otros filtros o explora todas las categorías.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
