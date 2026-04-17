import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getColors } from "@/lib/repositories/colors"

export const metadata = {
  title: "Checkout | Senda Deco",
  description: "Completa tu compra en Senda Deco",
}

export default async function CheckoutPage() {
  const colorOptions = await getColors()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-10 md:mb-14 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Checkout
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Envío y pago
          </h1>
        </div>
        <CheckoutForm colorOptions={colorOptions} />
      </main>
      <Footer />
    </div>
  )
}
