"use client"

import { useSearchParams } from "next/navigation"
import type { Product } from "@/types"
import { ProductCard } from "@/components/product-card"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const searchParams = useSearchParams()
  
  const category = searchParams.get("category")
  const color = searchParams.get("color")

  const filteredProducts = products.filter((product) => {
    if (category && !product.categories.includes(category)) return false
    if (color && !product.variants.some((v) => v.colorSlug === color)) return false
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
