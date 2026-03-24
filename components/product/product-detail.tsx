"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Truck, Hand } from "lucide-react"
import { type Product, colors, calculateDeliveryTime, formatPrice } from "@/lib/data"
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
  
  const delivery = calculateDeliveryTime(product)
  const productColor = colors.find(c => c.id === product.color)

  const handleAddToCart = () => {
    addItem(product, quantity)
    router.push("/carrito")
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
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
      <div className="flex flex-col">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
          {product.name}
        </h1>
        
        <p className="text-2xl font-semibold text-foreground mt-2">
          {formatPrice(product.price)}
        </p>

        {/* Color Selector */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Color</h3>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id as typeof selectedColor)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  selectedColor === color.id
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Delivery Time */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="h-4 w-4" />
          <span className="font-medium text-foreground">Entrega estimada:</span>
          <span>{delivery.days} días</span>
        </div>

        {/* Quantity Selector */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Cantidad</h3>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className="mt-8 w-full md:w-auto md:px-12 rounded-full"
          onClick={handleAddToCart}
        >
          Agregar al carrito
        </Button>

        {/* Description */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Handmade Badge */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Hand className="h-4 w-4" />
          <span>Hecho a mano</span>
        </div>
      </div>
    </div>
  )
}
