"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Truck, Hand } from "lucide-react"
import type { Product } from "@/types"
import type { ColorRow } from "@/lib/repositories/colors"
import { formatProductDeliveryLabel, formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ProductImageCarousel } from "@/components/product/product-image-carousel"
import { cn } from "@/lib/utils"

type ProductDetailProps = {
  product: Product
  colorOptions: ColorRow[]
}

export function ProductDetail({ product, colorOptions }: ProductDetailProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  // Pick first variant with stock, or fallback to first variant
  const defaultVariant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
  const [selectedColor, setSelectedColor] = useState<string>(defaultVariant?.colorSlug ?? "")

  const deliveryLabel = formatProductDeliveryLabel(product)

  // Only show color swatches for variants the product actually has
  const variantSlugs = new Set(product.variants.map((v) => v.colorSlug))
  const variantColors = colorOptions.filter((c) => variantSlugs.has(c.slug))

  // Map colorSlug → stock for fast lookups in UI
  const stockByColor = Object.fromEntries(product.variants.map((v) => [v.colorSlug, v.stock]))
  const selectedStock = stockByColor[selectedColor] ?? 0

  const handleAddToCart = () => {
    addItem({ ...product, selectedColor }, quantity)
    router.push("/carrito")
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-start">
      {/* Product Images */}
      <ProductImageCarousel
        productId={product.id}
        imageIds={product.imageIds}
        alt={product.name}
        className="aspect-square"
        priority
      />

      {/* Product Info */}
      <div className="flex flex-col pt-2 md:pt-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-4">
          Senda Deco
        </p>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.35rem] font-medium text-foreground leading-tight">
          {product.name}
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-foreground mt-6 tracking-wide">
          {formatPrice(product.price)}
        </p>

        {/* Color Selector */}
        <div className="mt-10">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Color
            {selectedColor && (
              <span className="ml-3 normal-case tracking-normal text-foreground/70">
                {stockByColor[selectedColor] > 0
                  ? `· ${stockByColor[selectedColor]} disponible${stockByColor[selectedColor] !== 1 ? "s" : ""}`
                  : "· Sin stock"}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-4">
            {variantColors.map((color) => {
              const colorStock = stockByColor[color.slug] ?? 0
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.slug)}
                  className={cn(
                    "relative h-11 w-11 rounded-full border-2 transition-all duration-300 shadow-inner",
                    selectedColor === color.slug
                      ? "border-primary ring-2 ring-primary/25 ring-offset-4 ring-offset-background scale-105"
                      : "border-border/80 hover:border-primary/40",
                    colorStock === 0 && "opacity-40"
                  )}
                  style={{ backgroundColor: color.hex ?? undefined }}
                  title={colorStock > 0 ? color.name : `${color.name} — sin stock`}
                />
              )
            })}
          </div>
        </div>

        {/* Delivery Time */}
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.5} />
          <span className="text-foreground/80">Entrega estimada</span>
          <span className="text-muted-foreground">· {deliveryLabel} días</span>
        </div>

        {/* Quantity Selector */}
        <div className="mt-10">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Cantidad
          </h3>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-base font-medium tabular-nums">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className="mt-12 w-full md:w-auto md:min-w-[240px]"
          onClick={handleAddToCart}
          disabled={selectedStock === 0 && product.variants.length > 0}
        >
          {selectedStock === 0 && product.variants.length > 0
            ? "Sin stock en este color"
            : "Agregar al carrito"}
        </Button>

        {/* Description */}
        <div className="mt-14 pt-12 border-t border-border/60">
          <p className="text-muted-foreground leading-[1.75] text-[15px] max-w-prose">
            {product.description}
          </p>
        </div>

        {/* Handmade Badge */}
        <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
          <Hand className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.5} />
          <span className="tracking-wide">Hecho a mano</span>
        </div>
      </div>
    </div>
  )
}
