"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Truck, Hand } from "lucide-react"
import { type Product, colors, formatProductDeliveryLabel, formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProductDetailProps = {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.color)
  
  const deliveryLabel = formatProductDeliveryLabel(product)
  const variantColors = colors.filter((c) => product.colors.includes(c.id))

  const handleAddToCart = () => {
    addItem({ ...product, color: selectedColor }, quantity)
    router.push("/carrito")
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-start">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted ring-1 ring-border/40 shadow-sm shadow-foreground/[0.04]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

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
          </h3>
          <div className="flex flex-wrap gap-4">
            {variantColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color.id as typeof selectedColor)}
                className={cn(
                  "h-11 w-11 rounded-full border-2 transition-all duration-300 shadow-inner",
                  selectedColor === color.id
                    ? "border-primary ring-2 ring-primary/25 ring-offset-4 ring-offset-background scale-105"
                    : "border-border/80 hover:border-primary/40"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
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
        >
          Agregar al carrito
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
