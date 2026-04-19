"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Truck } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function OrderConfirmation({ orderId }: { orderId?: string }) {
  const router = useRouter()
  const { currentOrder } = useCart()

  // Prefer the URL orderId, fall back to cart context
  const displayId = orderId ?? currentOrder?.id

  useEffect(() => {
    if (!displayId) {
      router.push("/")
    }
  }, [displayId, router])

  if (!displayId) {
    return null
  }

  const deliveryTime = currentOrder?.deliveryTime

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
        Gracias por tu compra
      </h1>

      <p className="text-muted-foreground mb-2">
        Número Orden: <span className="font-medium text-foreground">#{displayId}</span>
      </p>

      {deliveryTime && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <Truck className="h-4 w-4" />
          <span>Tiempo de entrega: {deliveryTime} días</span>
        </div>
      )}

      <Link href={`/seguimiento?order=${displayId}`}>
        <Button size="lg" className="rounded-full px-8">
          Seguir pedido
        </Button>
      </Link>
    </div>
  )
}
