"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, Truck, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { calculateCartDeliveryTime, formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"

export function CartContent() {
  const { items, updateQuantity, removeItem, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium text-foreground mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-6">
          Explora nuestra colección y encuentra algo que te encante.
        </p>
        <Link href="/productos">
          <Button className="rounded-full">Ver productos</Button>
        </Link>
      </div>
    )
  }

  const deliveryTime = calculateCartDeliveryTime(items)

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-card rounded-xl border border-border"
          >
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatPrice(item.price)}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <p className="font-semibold text-foreground">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl border border-border p-6 sticky top-20">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Resumen del pedido
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-foreground">Calculado en checkout</span>
            </div>
          </div>

          <div className="border-t border-border my-4 pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatPrice(total)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button className="w-full rounded-full" size="lg">
              Ir a pagar
            </Button>
          </Link>

          {/* Delivery Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
<h3 className="text-sm font-medium text-foreground mb-2">
            Resumen de entrega
          </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Tu pedido llega en {deliveryTime} días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
