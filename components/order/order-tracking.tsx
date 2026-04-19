"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { HelpCircle, Loader2 } from "lucide-react"
import { OrderStepper } from "@/components/order-stepper"
import { formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"
import type { Order } from "@/types"

const paymentMethodLabels: Record<string, string> = {
  mercadopago: "Mercado Pago",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
}

export function OrderTracking() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      setNotFound(true)
      return
    }

    setLoading(true)
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        if (data?.order) setOrder(data.order)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-foreground font-medium">Pedido no encontrado</p>
        <p className="text-sm text-muted-foreground">
          Verificá el número de orden o revisá el email de confirmación.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Order Stepper */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm p-6 md:p-8">
        <OrderStepper currentStatus={order.status} />
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground mb-4">Detalles del pedido</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Estado</span>
              <span className="text-foreground text-right">
                {order.status === "pendiente" ? "Pendiente"
                  : order.status === "en_produccion" ? "En producción"
                  : order.status === "listo" ? "Listo"
                  : order.status === "enviado" ? "Enviado"
                  : "Entregado"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Calle</span>
              <span className="text-foreground text-right break-words min-w-0">{order.customer.calle}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Código Postal</span>
              <span className="text-foreground text-right">{order.customer.codigoPostal}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground mb-4">Información de pago</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Método de pago</span>
              <span className="text-foreground text-right">{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Ciudad</span>
              <span className="text-foreground text-right break-words min-w-0">{order.customer.ciudad}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Email</span>
              <span className="text-foreground text-right break-all min-w-0">{order.customer.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground mb-4">Productos</h2>

        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">x{item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-foreground shrink-0 tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border/70 pt-4">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">{formatPrice(order.total)}</span>
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

