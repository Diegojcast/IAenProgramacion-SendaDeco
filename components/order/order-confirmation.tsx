"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Truck } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function OrderConfirmation() {
  const router = useRouter()
  const { currentOrder } = useCart()

  useEffect(() => {
    if (!currentOrder) {
      router.push("/")
    }
  }, [currentOrder, router])

  if (!currentOrder) {
    return null
  }

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
        Gracias por tu compra
      </h1>

      <p className="text-muted-foreground mb-2">
        Número Orden: <span className="font-medium text-foreground">#{currentOrder.id}</span>
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
        <Truck className="h-4 w-4" />
        <span>Tiempo de entrega: {currentOrder.deliveryTime} días</span>
      </div>

      <Link href={`/seguimiento?order=${currentOrder.id}`}>
        <Button size="lg" className="rounded-full px-8">
          Seguir pedido
        </Button>
      </Link>
    </div>
  )
}
