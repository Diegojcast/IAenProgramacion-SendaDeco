"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatCartDeliveryLabel, formatPrice, type Order } from "@/lib/data"
import { registerOrderMock } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clearCart, setCurrentOrder } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    calle: "",
    ciudad: "",
    codigoPostal: "",
    deliveryMethod: "envio" as "envio" | "retiro",
    paymentMethod: "mercadopago" as "mercadopago" | "transferencia" | "efectivo",
  })

  const deliveryTime = formatCartDeliveryLabel(items)

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      setShouldRedirect(true)
    }
  }, [items.length, isSubmitting])

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/carrito")
    }
  }, [shouldRedirect, router])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create order
    const order: Order = {
      id: `#${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      customer: {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        calle: formData.calle,
        ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal,
      },
      deliveryMethod: formData.deliveryMethod,
      paymentMethod: formData.paymentMethod,
      status: "pendiente",
      total,
      deliveryTime,
      createdAt: new Date(),
    }

    // Simulate API call
    setTimeout(() => {
      registerOrderMock(order)
      setCurrentOrder(order)
      clearCart()
      router.push("/confirmacion")
    }, 1000)
  }

  if (items.length === 0 || shouldRedirect) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10 lg:gap-14">
      {/* Form Fields */}
      <div className="lg:col-span-2 space-y-12 md:space-y-14">
        {/* Personal Data */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            Tus datos
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
          </div>
        </section>

        {/* Shipping Address */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            Dirección de envío
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="calle">Calle</Label>
              <Input
                id="calle"
                required
                value={formData.calle}
                onChange={(e) => handleChange("calle", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                required
                value={formData.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                required
                value={formData.codigoPostal}
                onChange={(e) => handleChange("codigoPostal", e.target.value)}
                className="bg-card rounded-xl border-border/70 h-11"
              />
            </div>
          </div>
        </section>

        {/* Delivery Method */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            Envío
          </h2>
          <RadioGroup
            value={formData.deliveryMethod}
            onValueChange={(value) => handleChange("deliveryMethod", value)}
            className="flex gap-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="envio" id="envio" />
              <Label htmlFor="envio" className="cursor-pointer">Envío</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="retiro" id="retiro" />
              <Label htmlFor="retiro" className="cursor-pointer">Retiro</Label>
            </div>
          </RadioGroup>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            Pago
          </h2>
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) => handleChange("paymentMethod", value)}
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mercadopago" id="mercadopago" />
              <Label htmlFor="mercadopago" className="cursor-pointer">Mercado Pago</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transferencia" id="transferencia" />
              <Label htmlFor="transferencia" className="cursor-pointer">Transferencia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="efectivo" id="efectivo" />
              <Label htmlFor="efectivo" className="cursor-pointer">Efectivo</Label>
            </div>
          </RadioGroup>
        </section>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-2xl border border-border/60 p-8 md:p-9 sticky top-24 shadow-sm shadow-foreground/[0.02]">
          <h2 className="font-serif text-xl font-medium text-foreground mb-8">Resumen</h2>

          <div className="flex items-start gap-3 text-sm text-muted-foreground mb-8 leading-relaxed">
            <Truck className="h-4 w-4 shrink-0 mt-0.5 opacity-70" strokeWidth={1.5} />
            <span>Entrega estimada · {deliveryTime} días hábiles aprox.</span>
          </div>

          <div className="space-y-4 text-sm border-t border-border/70 pt-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-foreground tracking-wide">{formatPrice(500)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium pt-4 border-t border-border/70">
              <span className="text-foreground">Total</span>
              <span className="text-foreground tracking-wide">{formatPrice(total + 500)}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-8" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar compra"}
          </Button>
        </div>
      </div>
    </form>
  )
}
