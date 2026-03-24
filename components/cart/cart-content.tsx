"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, Truck, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatCartDeliveryLabel, formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"

export function CartContent() {
  const { items, updateQuantity, removeItem, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-28 text-center px-4">
        <ShoppingBag className="h-14 w-14 text-muted-foreground/70 mb-6" strokeWidth={1.25} />
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-3">
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-10 max-w-sm leading-relaxed">
          Explorá la colección y elegí piezas hechas a mano para tu espacio.
        </p>
        <Link href="/productos">
          <Button className="px-10">Ver colección</Button>
        </Link>
      </div>
    )
  }

  const deliveryTime = formatCartDeliveryLabel(items)

  return (
    <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-5">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.color}`}
            className="flex gap-5 p-6 md:p-7 bg-card rounded-2xl border border-border/60 shadow-sm shadow-foreground/[0.02]"
          >
            <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/30">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-normal text-foreground truncate text-base">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 tracking-wide">
                {formatPrice(item.price)}
              </p>
              
              <div className="flex items-center gap-3 mt-5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id, item.color)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <p className="font-medium text-foreground tracking-wide">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-2xl border border-border/60 p-8 md:p-9 sticky top-24 shadow-sm shadow-foreground/[0.02]">
          <h2 className="font-serif text-xl font-medium text-foreground mb-8">
            Resumen
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-foreground">Calculado en checkout</span>
            </div>
          </div>

          <div className="border-t border-border/70 my-6 pt-6">
            <div className="flex justify-between text-lg font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatPrice(total)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button className="w-full mt-2" size="lg">
              Ir a pagar
            </Button>
          </Link>

          {/* Delivery Summary */}
          <div className="mt-8 p-5 bg-secondary/40 rounded-2xl border border-border/40">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Entrega estimada
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.5} />
              <span className="leading-relaxed">{deliveryTime} días hábiles aprox.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
