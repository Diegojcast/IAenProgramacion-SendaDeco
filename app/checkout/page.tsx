import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata = {
  title: "Checkout | Senda Deco",
  description: "Completa tu compra en Senda Deco",
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 md:py-20 px-5 md:px-8">
        <div className="mb-10 md:mb-14 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Checkout
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Envío y pago
          </h1>
        </div>
        <CheckoutForm />
      </main>
      <Footer />
    </div>
  )
}
