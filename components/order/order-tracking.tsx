"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { HelpCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { OrderStepper } from "@/components/order-stepper"
import { formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"

const paymentMethodLabels = {
  mercadopago: "Mercado Pago",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
}

export function OrderTracking() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentOrder } = useCart()
  
  const orderId = searchParams.get("order")

  useEffect(() => {
    if (!currentOrder && !orderId) {
      router.push("/")
    }
  }, [currentOrder, orderId, router])

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró información del pedido.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Order Stepper */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <OrderStepper currentStatus={currentOrder.status} />
      </div>

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Detalles del pedido</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="text-foreground">{currentOrder.status === "pendiente" ? "Pendiente" : currentOrder.status === "enviado" ? "Enviado" : "Completado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calle</span>
              <span className="text-foreground">{currentOrder.customer.calle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código Postal</span>
              <span className="text-foreground">{currentOrder.customer.codigoPostal}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Información de pago</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pago</span>
              <span className="text-foreground">{paymentMethodLabels[currentOrder.paymentMethod]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ciudad</span>
              <span className="text-foreground">{currentOrder.customer.ciudad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{currentOrder.customer.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-xl border border-border p-6 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Productos</h2>
        
        <div className="space-y-4">
          {currentOrder.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </div>
              <p className="font-medium text-foreground">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatPrice(currentOrder.total + 500)}</span>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
          <HelpCircle className="h-6 w-6" />
          <span className="sr-only">Ayuda</span>
        </Button>
      </div>
    </div>
  )
}
