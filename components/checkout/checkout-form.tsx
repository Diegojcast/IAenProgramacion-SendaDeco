"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Truck } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { ProductImageCarousel } from "@/components/product/product-image-carousel"
import {
  formatCartDeliveryLabel,
  formatPrice,
  type Order,
} from "@/lib/data"
import type { ColorRow } from "@/lib/repositories/colors"

import {
  checkoutFormSchema,
  CHECKOUT_SHIPPING_ARS,
  type CheckoutFormValues,
} from "@/lib/checkout-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

function colorLabel(colorId: string, colorOptions: ColorRow[]) {
  return colorOptions.find((c) => c.slug === colorId)?.name ?? colorId
}

export function CheckoutForm({ colorOptions }: { colorOptions: ColorRow[] }) {
  const router = useRouter()
  const { items, total, clearCart, setCurrentOrder } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      calle: "",
      ciudad: "",
      codigoPostal: "",
      deliveryMethod: "envio",
      paymentMethod: "transferencia",
    },
    mode: "onTouched",
  })

  const deliveryMethod = form.watch("deliveryMethod")
  const deliveryTime = formatCartDeliveryLabel(items)
  const subtotal = total
  const shippingCost = deliveryMethod === "envio" ? CHECKOUT_SHIPPING_ARS : 0
  const grandTotal = subtotal + shippingCost

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

  useEffect(() => {
    if (deliveryMethod === "retiro") {
      form.clearErrors(["calle", "ciudad", "codigoPostal"])
    }
  }, [deliveryMethod, form])

  const onSubmit = (values: CheckoutFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const ship =
      values.deliveryMethod === "envio" ? CHECKOUT_SHIPPING_ARS : 0
    const orderTotal = subtotal + ship

    const order: Order = {
      id: `${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      customer: {
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        telefono: values.telefono.trim(),
        calle:
          values.deliveryMethod === "envio"
            ? values.calle?.trim() ?? ""
            : values.calle?.trim() || "Retiro en local",
        ciudad:
          values.deliveryMethod === "envio"
            ? values.ciudad?.trim() ?? ""
            : values.ciudad?.trim() || "—",
        codigoPostal:
          values.deliveryMethod === "envio"
            ? values.codigoPostal?.trim() ?? ""
            : values.codigoPostal?.trim() || "—",
      },
      deliveryMethod: values.deliveryMethod,
      paymentMethod: values.paymentMethod,
      status: "pendiente",
      total: orderTotal,
      deliveryTime,
      createdAt: new Date(),
    }

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al guardar la orden")
        return res.json()
      })
      .then(({ order: saved }) => {
        setCurrentOrder(saved)
        clearCart()
        router.push(`/confirmacion?orderId=${saved.id}`)
      })
      .catch(() => {
        setSubmitError("Hubo un error al procesar tu pedido. Por favor, intentá de nuevo.")
        setIsSubmitting(false)
      })
  }

  if (items.length === 0 || shouldRedirect) {
    return null
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid lg:grid-cols-3 gap-10 lg:gap-14"
      >
        <div className="lg:col-span-2 space-y-12 md:space-y-14">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
              Tus datos
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        className="bg-card rounded-xl border-border/70 h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        className="bg-card rounded-xl border-border/70 h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="Ej. 11 2345 6789"
                        className="bg-card rounded-xl border-border/70 h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
              Envío
            </h2>
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="envio" id="envio" />
                        <Label htmlFor="envio" className="cursor-pointer font-normal">
                          Envío a domicilio
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="retiro" id="retiro" />
                        <Label htmlFor="retiro" className="cursor-pointer font-normal">
                          Retiro en local
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {deliveryMethod === "retiro" && (
              <p className="text-sm text-muted-foreground mt-4 max-w-md leading-relaxed">
                Te avisamos cuando tu pedido esté listo para retirar. La dirección de envío no aplica.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
              Dirección {deliveryMethod === "envio" ? "" : "(opcional)"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              <FormField
                control={form.control}
                name="calle"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Calle y número</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="street-address"
                        className={cn(
                          "bg-card rounded-xl border-border/70 h-11",
                          deliveryMethod === "retiro" && "opacity-70"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="address-level2"
                        className={cn(
                          "bg-card rounded-xl border-border/70 h-11",
                          deliveryMethod === "retiro" && "opacity-70"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="codigoPostal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código postal</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="postal-code"
                        className={cn(
                          "bg-card rounded-xl border-border/70 h-11",
                          deliveryMethod === "retiro" && "opacity-70"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
              Pago
            </h2>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-x-8 gap-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transferencia" id="transferencia" />
                        <Label htmlFor="transferencia" className="cursor-pointer font-normal">
                          Transferencia
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="efectivo" id="efectivo" />
                        <Label htmlFor="efectivo" className="cursor-pointer font-normal">
                          Efectivo
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border/60 p-8 md:p-9 sticky top-24 shadow-sm shadow-foreground/[0.02]">
            <h2 className="font-serif text-xl font-medium text-foreground mb-6">
              Tu pedido
            </h2>

            <ul className="max-h-[min(360px,50vh)] space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.selectedColor}`}
                  className="flex gap-4 text-sm"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/30">
                    <ProductImageCarousel
                      productId={item.id}
                      imageIds={item.imageIds}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {colorLabel(item.selectedColor, colorOptions)} · Cant. {item.quantity}
                    </p>
                    <p className="text-foreground mt-1 tracking-wide tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Separator className="my-6 bg-border/70" />

            <div className="flex items-start gap-3 text-sm text-muted-foreground mb-6 leading-relaxed">
              <Truck
                className="h-4 w-4 shrink-0 mt-0.5 opacity-70"
                strokeWidth={1.5}
              />
              <span>Entrega estimada · {deliveryTime} días hábiles aprox.</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground tabular-nums tracking-wide">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {deliveryMethod === "envio" ? "Envío" : "Retiro"}
                </span>
                <span className="text-foreground tabular-nums tracking-wide">
                  {deliveryMethod === "envio"
                    ? formatPrice(CHECKOUT_SHIPPING_ARS)
                    : formatPrice(0)}
                </span>
              </div>
            </div>

            <Separator className="my-5 bg-border/70" />

            <div className="flex justify-between text-lg font-medium gap-4">
              <span className="text-foreground">Total</span>
              <span className="text-foreground tabular-nums tracking-wide">
                {formatPrice(grandTotal)}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full mt-8"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar compra"}
            </Button>

            {submitError && (
              <p className="mt-3 text-sm text-destructive text-center">{submitError}</p>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
